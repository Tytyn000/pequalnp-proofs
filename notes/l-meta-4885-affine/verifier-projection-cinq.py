import argparse
import concurrent.futures
import json
from pathlib import Path
import subprocess
import tempfile

NOTES = Path(__file__).resolve().parent
PATTERNS = {"2+2+1", "2+1+1+1", "1+1+1+1+1"}


def parse_selection(text, available):
    if text == "all":
        return set(available)
    selected = {int(field) for field in text.split(",") if field}
    if not selected <= available:
        raise ValueError("Selection includes an orbit outside the supported three patterns")
    return selected


def run_case(index, orbit, args, catalog):
    with tempfile.TemporaryDirectory(prefix="affine-cinq-") as directory:
        cnf = Path(directory) / "instance.cnf"
        proof = Path(directory) / "instance.drat"
        generated = subprocess.run(
            ["node", NOTES / "projection-cinq.cjs", catalog, str(index), cnf],
            check=True, capture_output=True, text=True,
        )
        shape = json.loads(generated.stdout)
        command = [args.kissat, f"--time={args.time}", cnf]
        certify = index in args.certified
        if certify:
            command.append(proof)
        result = subprocess.run(command, capture_output=True, text=True)
        verdicts = [line[2:] for line in result.stdout.splitlines() if line.startswith("s ")]
        expected_codes = {10: "SATISFIABLE", 20: "UNSATISFIABLE", 0: "UNKNOWN"}
        if len(verdicts) != 1 or expected_codes.get(result.returncode) != verdicts[0]:
            raise RuntimeError(f"Unexpected Kissat result for orbit {index}: {result.stderr}")
        verification = "-"
        if certify and result.returncode == 20:
            checked = subprocess.run([args.checker, cnf, proof], capture_output=True, text=True)
            if checked.returncode or "s VERIFIED" not in checked.stdout.splitlines():
                raise RuntimeError(f"DRAT verification failed for orbit {index}: {checked.stdout}")
            verification = "VERIFIED"
        return index, orbit["pattern"], shape["clauses"], verdicts[0], verification


def main():
    parser = argparse.ArgumentParser(description="Replay the five-edge affine SAT projection")
    parser.add_argument("kissat", help="Kissat executable")
    parser.add_argument("--orbits", default="all", help="Comma-separated orbit numbers, or all")
    parser.add_argument("--jobs", type=int, default=4, help="Number of concurrent instances")
    parser.add_argument("--time", type=int, default=15, help="Kissat time limit per instance")
    parser.add_argument("--checker", help="drat-trim executable")
    parser.add_argument("--certify", default="", help="Comma-separated orbits to check with DRAT, or all")
    args = parser.parse_args()
    if args.jobs < 1 or args.time < 1:
        parser.error("--jobs and --time must be positive")
    result = subprocess.run(
        ["node", NOTES / "frontiere.cjs", "five-deep-orbits"],
        check=True, capture_output=True, text=True,
    )
    orbit_table = json.loads(result.stdout)
    available = {
        i: orbit for i, orbit in enumerate(orbit_table["representatives"], 1)
        if orbit["pattern"] in PATTERNS
    }
    selected = parse_selection(args.orbits, set(available))
    args.certified = parse_selection(args.certify, selected)
    if args.certified and not args.checker:
        parser.error("--certify requires --checker")
    with tempfile.TemporaryDirectory(prefix="affine-cinq-catalog-") as directory:
        catalog = Path(directory) / "orbits.json"
        catalog.write_text(result.stdout)
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as workers:
            jobs = [workers.submit(run_case, i, available[i], args, catalog) for i in sorted(selected)]
            print("orbite\trepartition\tclauses\tverdict\tverification", flush=True)
            for job in concurrent.futures.as_completed(jobs):
                print("\t".join(map(str, job.result())), flush=True)


if __name__ == "__main__":
    main()
