import PEqualNP.Defs

private theorem lib820_getD_take {α : Type} (xs : List α) (d : α) (i j : Nat)
    (h : j < min i xs.length) :
    (xs.take i).getD j d = xs.getD j d := by
  have hi : j < i := lt_of_lt_of_le h (min_le_left ..)
  have hj : j < xs.length := lt_of_lt_of_le h (min_le_right ..)
  simp [List.getD_eq_getElem?_getD, hi, hj]

private theorem lib820_getD_idxOf (xs : List Nat) (w d : Nat) (h : w ∈ xs) :
    xs.getD (xs.idxOf w) d = w := by
  have hi := List.idxOf_lt_length_of_mem h
  rw [List.getD_eq_getElem?_getD, List.getElem?_eq_getElem hi]
  exact List.getElem_idxOf hi

private theorem lib820_fold {α β : Type} (f : β → α → β) (start : β)
    (gs : List α) (states : Nat → β)
    (h0 : states 0 = start)
    (hs : ∀ i (hi : i < gs.length), f (states i) gs[i] = states (i+1)) :
    gs.foldl f start = states gs.length := by
  suffices ∀ i, i ≤ gs.length → (gs.take i).foldl f start = states i by
    simpa using this gs.length (Nat.le_refl _)
  intro i
  induction i with
  | zero => intro; simpa using h0.symm
  | succ i ih =>
    intro hi
    have hj : i < gs.length := by omega
    rw [List.take_succ_eq_append_getElem hj, List.foldl_append, ih (by omega)]
    exact hs i hj

theorem PEqualNP.Outside.L_lib_820 : (∀ (N k s : Nat) (C : PEqualNP.CircuitLowerBounds.Circuit) (J : Fin s ↪ Fin C.size)
    (port : Fin k ↪ Fin (N+C.size)) (o : Fin (N+C.size)),
  let old := List.ofFn (fun b : Fin k => (port b).val) ++
    List.ofFn (fun i : Fin s => N+(J i).val)
  StrictMono J → (∀ b i, (port b).val ≠ N+(J i).val) →
  (∀ i (w : Nat), w ∈ (PEqualNP.MetaComplexity.NestedCover.gateAt C (J i).val).inputs →
    w < N+(J i).val ∧ ((∃ b, (port b).val = w) ∨ ∃ j, j < i ∧ N+(J j).val = w)) →
  o.val ∈ old →
  ∃ D : PEqualNP.CircuitLowerBounds.Circuit, D.size = s ∧ PEqualNP.MetaComplexity.NestedCover.ReadsBack k D ∧
    old.getD D.output (N+C.size) = o.val ∧
    (∀ i : Fin s,
      let d := PEqualNP.MetaComplexity.NestedCover.gateAt D i.val
      let g := PEqualNP.MetaComplexity.NestedCover.gateAt C (J i).val
      d.op = g.op ∧ d.inputs.map (fun w => old.getD w (N+C.size)) = g.inputs) ∧
    ∀ v : Nat → Bool,
      (∀ i : Fin s, let g := PEqualNP.MetaComplexity.NestedCover.gateAt C (J i).val
        v (N+(J i).val) = g.op.eval (g.inputs.map v)) →
      let z := List.ofFn (fun b : Fin k => v (port b).val)
      D.wires z = z ++ List.ofFn (fun i : Fin s => v (N+(J i).val)) ∧ D.eval z = v o.val) := by
  intro N k s C J port o
  dsimp only
  intro hmono hdisjoint hinput houtput
  let old := List.ofFn (fun b : Fin k => (port b).val) ++
    List.ofFn (fun i : Fin s => N + (J i).val)
  let orig (i : Fin s) := PEqualNP.MetaComplexity.NestedCover.gateAt C (J i).val
  have hold : old.length = k+s := by simp [old]
  have hp (i : Fin s) (w : Nat) (hw : w ∈ (orig i).inputs) :
      w ∈ old.take (k+i.val) := by
    rcases (hinput i w hw).2 with ⟨b, rfl⟩ | ⟨j, hj, rfl⟩
    · apply List.mem_iff_getElem.mpr
      refine ⟨b.val, ?_, ?_⟩
      · simp [hold]; omega
      · simp [old, List.getElem_append_left, b.isLt]
    · apply List.mem_iff_getElem.mpr
      refine ⟨k+j.val, ?_, ?_⟩
      · simp [hold]; omega
      · simp [old, List.getElem_append_right]
  have hidx (i : Fin s) (w : Nat) (hw : w ∈ (orig i).inputs) :
      (old.take (k+i.val)).idxOf w < min (k+i.val) old.length := by
    simpa using List.idxOf_lt_length_of_mem (hp i w hw)
  let loc (i : Fin s) (w : Nat) := (old.take (k+i.val)).idxOf w
  let copy (i : Fin s) : PEqualNP.CircuitLowerBounds.Gate :=
    ⟨(orig i).op, (orig i).inputs.map (loc i)⟩
  let D : PEqualNP.CircuitLowerBounds.Circuit := ⟨List.ofFn copy, old.idxOf o.val⟩
  have hd : D.gates.length = s := by simp [D]
  have ho : D.output < old.length := List.idxOf_lt_length_of_mem houtput
  have hout : old.getD D.output (N+C.size) = o.val := by
    change old.getD (old.idxOf o.val) (N+C.size) = o.val
    exact lib820_getD_idxOf old _ _ houtput
  have hre (i : Fin s) (w : Nat) (hw : w ∈ (orig i).inputs) :
      old.getD (loc i w) (N+C.size) = w := by
    rw [← lib820_getD_take old _ _ _ (hidx i w hw)]
    exact lib820_getD_idxOf _ _ _ (hp i w hw)
  have hgate (i : Fin s) : PEqualNP.MetaComplexity.NestedCover.gateAt D i.val = copy i := by
    simp [PEqualNP.MetaComplexity.NestedCover.gateAt, D, List.getD_eq_getElem?_getD, i.isLt]
  refine ⟨D, hd, ?_, ?_, ?_, ?_⟩
  · intro i hi w hw
    let j : Fin s := ⟨i, by simpa [hd] using hi⟩
    change w ∈ (PEqualNP.MetaComplexity.NestedCover.gateAt D j.val).inputs at hw
    rw [hgate] at hw
    obtain ⟨a, ha, rfl⟩ := List.mem_map.mp hw
    exact lt_of_lt_of_le (hidx j a ha) (min_le_left ..)
  · exact hout
  · intro i
    rw [hgate]
    refine ⟨rfl, ?_⟩
    change ((orig i).inputs.map (loc i)).map _ = (orig i).inputs
    rw [List.map_map]
    exact List.map_congr_left (fun a ha => hre i a ha) |>.trans (List.map_id _)
  · intro v hv
    let all := old.map v
    let z := List.ofFn (fun b : Fin k => v (port b).val)
    have ha : all = z ++ List.ofFn (fun i : Fin s => v (N+(J i).val)) := by
      simp [all, old, z, List.map_ofFn, Function.comp_def]
    have hlen : all.length = k+s := by simp [all, hold]
    have hzero : all.take k = z := by rw [ha]; simp [z]
    have htrace : D.wires z = all := by
      unfold PEqualNP.CircuitLowerBounds.Circuit.wires
      rw [lib820_fold _ z D.gates (fun i => all.take (k+i)) (by simpa using hzero)]
      · rw [hd, ← hlen]; simp
      · intro i hi
        let j : Fin s := ⟨i, by simpa [hd] using hi⟩
        have hj : k+i < all.length := by rw [hlen]; exact Nat.add_lt_add_left j.isLt _
        have hg : D.gates[i] = copy j := by simp [D, j, List.getElem_ofFn]
        rw [hg, ← Nat.add_assoc, List.take_succ_eq_append_getElem hj]
        congr 1
        have hval (a : Nat) (haa : a ∈ (orig j).inputs) :
            (all.take (k+i)).getD (loc j a) false = v a := by
          have hb := hidx j a haa
          rw [lib820_getD_take _ _ _ _ (by simpa [all, j] using hb)]
          have hc : loc j a < old.length := lt_of_lt_of_le hb (min_le_right ..)
          simpa [all, List.getD_eq_getElem?_getD, hc] using congrArg v (hre j a haa)
        have hm : ((copy j).inputs.map fun w => (all.take (k+i)).getD w false) =
            (orig j).inputs.map v := by
          simp only [copy, List.map_map]
          exact List.map_congr_left hval
        rw [hm]
        simpa [copy, ha, z, List.getElem_append_right, j] using (hv j).symm
    refine ⟨htrace.trans ha, ?_⟩
    unfold PEqualNP.CircuitLowerBounds.Circuit.eval
    rw [htrace]
    simpa [all, List.getD_eq_getElem?_getD, ho] using congrArg v hout
