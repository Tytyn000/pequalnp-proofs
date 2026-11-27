"""Search for a 43-gate circuit, adding violated maximal negative inputs."""

import argparse
import itertools
import json
import os
from pathlib import Path
import subprocess


def node(directory, env, *args):
    return subprocess.check_output(
        ["node", "frontiere.cjs", *map(str, args)], cwd=directory, env=env, text=True
    )


def initial_sample(positives, negatives, size):
    pairs = {
        (1 << left) | (1 << right)
        for left, right in itertools.combinations(range(21), 2)
    } - set(positives)
    coverage = {
        mask: {pair for pair in pairs if mask & pair == pair} for mask in negatives
    }
    sample = []
    while pairs:
        mask = max(coverage, key=lambda item: len(coverage[item] & pairs))
        covered = coverage.pop(mask) & pairs
        if not covered:
            raise ValueError("A nonedge has no maximal negative extension")
        pairs -= covered
        sample.append(mask)
    for mask in negatives:
        if len(sample) >= size:
            break
        if mask not in sample:
            sample.append(mask)
    return sample


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("kissat", type=Path)
    cli.add_argument("directory", type=Path)
    cli.add_argument("--initial", type=int, default=24)
    cli.add_argument("--time", type=int, default=70)
    cli.add_argument("--rounds", type=int, default=5)
    cli.add_argument("--seed", type=int, default=1)
    cli.add_argument("--deep", type=int, choices=(0, 6), default=6)
    cli.add_argument("--skip-pair-cover", action="store_true")
    args = cli.parse_args()
    if not 1 <= args.initial <= 197 or args.time < 1 or args.rounds < 1:
        cli.error("invalid sample size or search limit")

    here = Path(__file__).resolve().parent
    work = args.directory.resolve()
    work.mkdir(parents=True, exist_ok=False)
    clean_env = {name: value for name, value in os.environ.items() if not name.startswith("AFFINE_")}
    boundary = json.loads(node(here, clean_env, "boundary-masks"))
    positives, negatives = boundary["positives"], boundary["negatives"]
    if (len(positives), len(negatives)) != (36, 197):
        raise ValueError("Unexpected affine boundary")
    sample = negatives[:args.initial] if args.skip_pair_cover else initial_sample(positives, negatives, args.initial)

    for step in range(1, args.rounds + 1):
        prefix = work / f"round-{step}"
        sample_path = prefix.with_suffix(".samples.json")
        sample_path.write_text(json.dumps(sample) + "\n")
        env = clean_env | {
            "AFFINE_REFINEMENT": "1", "AFFINE_NEG_SAMPLES": str(sample_path),
            "AFFINE_MIN_DEEP_EDGES": str(args.deep), "AFFINE_COMPACT_ROWS": "1",
        }
        formula, log = prefix.with_suffix(".cnf"), prefix.with_suffix(".out")
        generated = subprocess.check_output(
            ["node", "frontiere.cjs", "build", formula, "43", str(len(negatives)), "ordered"],
            cwd=here, env=env, text=True,
        )
        counts = json.loads(generated)
        with log.open("w") as out:
            completed = subprocess.run(
                [args.kissat.resolve(), f"--time={args.time}", f"--seed={args.seed}", formula],
                stdout=out, stderr=subprocess.STDOUT,
            )
        statuses = [line[2:] for line in log.read_text().splitlines() if line.startswith("s ")]
        expected = {0: "UNKNOWN", 10: "SATISFIABLE", 20: "UNSATISFIABLE"}
        if statuses != [expected.get(completed.returncode)]:
            raise RuntimeError(f"Unexpected solver status in {log}")
        summary = {"round": step, "negatives": len(sample), "clauses": counts["clauses"],
                   "verdict": statuses[0]}
        if completed.returncode != 10:
            print(json.dumps(summary), flush=True)
            return

        node(here, clean_env, "model", formula, log)
        model = Path(str(log) + ".json")
        errors = json.loads(node(here, clean_env, "failures", model))
        missing, false = errors["incorrectPositives"], errors["incorrectNegatives"]
        if missing or not set(false).isdisjoint(sample):
            raise RuntimeError("Decoded model contradicts the encoded constraints")
        summary["extra_negatives"] = len(false)
        print(json.dumps(summary), flush=True)
        if not false:
            (work / "witness.json").write_bytes(model.read_bytes())
            return
        sample.extend(false)


if __name__ == "__main__":
    main()
