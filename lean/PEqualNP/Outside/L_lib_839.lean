import PEqualNP.Defs

private theorem lib839_row {n m : Nat} (A : Fin n → Fin m → Bool)
    (r : Fin n) (c : Fin m) (R P : Finset (Fin n)) (K Q : Finset (Fin m))
    (H : Finset (Fin n) → Finset (Fin m) → Bool)
    (D : Finset (Fin n) → Finset (Fin m) → Bool → Bool)
    (hr : r ∉ R) (hrp : r ∉ P) (hc : c ∉ K) (hcq : c ∉ Q)
    (hRP : Disjoint R P) (hKQ : Disjoint K Q) (hinj : Function.Injective A)
    (hH : H ∅ ∅ = false) (hD : D ∅ ∅ false = false)
    (mD : ∀ X X' Y Y' a b, X ⊆ X' → Y ⊆ Y' → a ≤ b → D X Y a ≤ D X' Y' b)
    (hA : ∀ i j, A i j = D ({i} ∩ P) ({j} ∩ Q) (!(H ({i} ∩ R) ({j} ∩ K)))) :
    (A r c = false → R.card ≤ 1 ∧ ∀ i ∈ R, H {i} ∅ = true) ∧
    (A r c = true → P.card ≤ 1 ∧ ∀ i ∈ P, D {i} ∅ false = true) := by
  have hs {a : Type} [DecidableEq a] (i : a) (S : Finset a) :
      ({i} : Finset a) ∩ S = if i ∈ S then {i} else ∅ := by
    split <;> rename_i h <;> ext j <;> simp [h]
  simp only [hs] at hA
  have hrow (j) : A r j = D ∅ (if j ∈ Q then {j} else ∅)
      (!(H ∅ (if j ∈ K then {j} else ∅))) := by
    simpa [hr, hrp] using hA r j
  have hcorner : A r c = D ∅ ∅ true := by simpa [hc,hcq,hH] using hrow c
  constructor
  · intro h
    have dz (b : Bool) : D ∅ ∅ b = false := by cases b <;> simp_all
    have shape (i) (hi : i ∈ R) (j) :
        A i j = D ∅ (if j ∈ Q then {j} else ∅)
          (!(H {i} (if j ∈ K then {j} else ∅))) := by
      have hip : i ∉ P := fun e => (Finset.disjoint_left.mp hRP hi e)
      simpa [hi,hip] using hA i j
    have sing (i) (hi : i ∈ R) : H {i} ∅ = true := by
      cases e : H {i} ∅
      · have he : A i = A r := by
          funext j
          rw [shape i hi, hrow]
          by_cases hj : j ∈ K
          · have hjq : j ∉ Q := fun hq => Finset.disjoint_left.mp hKQ hj hq
            simp [hjq,dz]
          · simp [hj,e,hH]
        exact False.elim (hr (hinj he ▸ hi))
      · rfl
    refine ⟨Finset.card_le_one.mpr ?_, sing⟩
    intro i hi j hj
    apply hinj
    funext z
    rw [shape i hi, shape j hj]
    by_cases hz : z ∈ K
    · have hzq : z ∉ Q := fun hq => Finset.disjoint_left.mp hKQ hz hq
      simp [hzq,dz]
    · simp [hz,sing i hi,sing j hj]
  · intro h
    have dt : D ∅ ∅ true = true := hcorner.symm.trans h
    have full (X : Finset (Fin n)) (Y : Finset (Fin m)) :
        D X Y true = true := by
      exact Bool.eq_true_of_true_le (by simpa [dt] using mD ∅ X ∅ Y true true (Finset.empty_subset _) (Finset.empty_subset _) le_rfl)
    have shape (i) (hi : i ∈ P) (j) :
        A i j = D {i} (if j ∈ Q then {j} else ∅)
          (!(H ∅ (if j ∈ K then {j} else ∅))) := by
      have hir : i ∉ R := fun e => Finset.disjoint_left.mp hRP e hi
      simpa [hi,hir] using hA i j
    have sing (i) (hi : i ∈ P) : D {i} ∅ false = true := by
      cases e : D {i} ∅ false
      · have he : A i = A r := by
          funext j
          rw [shape i hi, hrow]
          by_cases hj : j ∈ K
          · have hjq : j ∉ Q := fun hq => Finset.disjoint_left.mp hKQ hj hq
            simp only [hj,hjq,ite_true,ite_false]
            cases H ∅ ({j} : Finset (Fin m)) <;> simp [full,e,hD]
          · simp [hj,hH,full]
        exact False.elim (hrp (hinj he ▸ hi))
      · rfl
    have rowFull (i) (hi : i ∈ P) (j) : A i j = true := by
      rw [shape i hi]
      have hx := mD {i} {i} ∅ (if j ∈ Q then {j} else ∅) false
        (!(H ∅ (if j ∈ K then {j} else ∅))) (by rfl) (Finset.empty_subset _) (by simp)
      exact Bool.eq_true_of_true_le (by simpa [sing i hi] using hx)
    exact ⟨Finset.card_le_one.mpr (fun i hi j hj => hinj (funext fun z =>
      (rowFull i hi z).trans (rowFull j hj z).symm)), sing⟩

theorem PEqualNP.Outside.L_lib_839 : (∀ (n m : Nat) (A : Fin n → Fin m → Bool) (r : Fin n) (c : Fin m)
    (R : Finset (Fin n)) (K : Finset (Fin m))
    (H : Finset (Fin n) → Finset (Fin m) → Bool)
    (D : Finset (Fin n) → Finset (Fin m) → Bool → Bool),
  let P := (Finset.univ.erase r) \ R
  let Q := (Finset.univ.erase c) \ K
  r ∉ R → c ∉ K → Function.Injective A → Function.Injective (fun j i => A i j) →
  H ∅ ∅ = false → D ∅ ∅ false = false →
  (∀ X X' Y Y', X ⊆ X' → Y ⊆ Y' → H X Y ≤ H X' Y') →
  (∀ X X' Y Y' a b, X ⊆ X' → Y ⊆ Y' → a ≤ b → D X Y a ≤ D X' Y' b) →
  (∀ i j, A i j = D ({i} ∩ P) ({j} ∩ Q) (!(H ({i} ∩ R) ({j} ∩ K)))) →
  (A r c = false → R.card ≤ 1 ∧ K.card ≤ 1 ∧
    ∀ X ⊆ R, ∀ Y ⊆ K, H X Y = decide (X.Nonempty ∨ Y.Nonempty)) ∧
  (A r c = true → P.card ≤ 1 ∧ Q.card ≤ 1 ∧
    ∀ X ⊆ P, ∀ Y ⊆ Q, ∀ b : Bool, D X Y b = (b || decide (X.Nonempty ∨ Y.Nonempty)))) := by
  intro n m A r c R K H D
  dsimp only
  intro hr hc hri hci hH hD mH mD hA
  let P := (Finset.univ.erase r) \ R
  let Q := (Finset.univ.erase c) \ K
  have hrp : r ∉ P := by simp [P]
  have hcq : c ∉ Q := by simp [Q]
  have hRP : Disjoint R P := by
    exact Finset.disjoint_left.mpr (fun i hi hp => (Finset.mem_sdiff.mp hp).2 hi)
  have hKQ : Disjoint K Q := by
    exact Finset.disjoint_left.mpr (fun i hi hp => (Finset.mem_sdiff.mp hp).2 hi)
  have rows := lib839_row A r c R P K Q H D hr hrp hc hcq hRP hKQ hri hH hD mD hA
  have cols := lib839_row (fun j i => A i j) c r K Q R P (fun Y X => H X Y)
    (fun Y X b => D X Y b) hc hcq hr hrp hKQ hRP hci hH hD
    (fun _ _ _ _ _ _ hY hX hb => mD _ _ _ _ _ _ hX hY hb) (fun j i => hA i j)
  constructor
  · intro h
    obtain ⟨hR, sr⟩ := rows.1 h
    obtain ⟨hK, sc⟩ := cols.1 h
    refine ⟨hR,hK,?_⟩
    intro X hx Y hy
    by_cases he : X.Nonempty ∨ Y.Nonempty
    · simp only [decide_eq_true he]
      rcases he with ⟨i,hi⟩ | ⟨j,hj⟩
      · have e := mH {i} X ∅ Y (Finset.singleton_subset_iff.mpr hi) (Finset.empty_subset _)
        exact Bool.eq_true_of_true_le (by simpa [sr i (hx hi)] using e)
      · have e := mH ∅ X {j} Y (Finset.empty_subset _) (Finset.singleton_subset_iff.mpr hj)
        exact Bool.eq_true_of_true_le (by simpa [sc j (hy hj)] using e)
    · have eX : X = ∅ := Finset.not_nonempty_iff_eq_empty.mp (fun e => he (Or.inl e))
      have eY : Y = ∅ := Finset.not_nonempty_iff_eq_empty.mp (fun e => he (Or.inr e))
      simp [eX,eY,hH]
  · intro h
    obtain ⟨hP, sr⟩ := rows.2 h
    obtain ⟨hQ, sc⟩ := cols.2 h
    refine ⟨hP,hQ,?_⟩
    intro X hx Y hy b
    by_cases he : X.Nonempty ∨ Y.Nonempty
    · simp only [decide_eq_true he, Bool.or_true]
      rcases he with ⟨i,hi⟩ | ⟨j,hj⟩
      · have e := mD {i} X ∅ Y false b (Finset.singleton_subset_iff.mpr hi)
          (Finset.empty_subset _) (by simp)
        exact Bool.eq_true_of_true_le (by simpa [sr i (hx hi)] using e)
      · have e := mD ∅ X {j} Y false b (Finset.empty_subset _)
          (Finset.singleton_subset_iff.mpr hj) (by simp)
        exact Bool.eq_true_of_true_le (by simpa [sc j (hy hj)] using e)
    · have eX : X = ∅ := Finset.not_nonempty_iff_eq_empty.mp (fun e => he (Or.inl e))
      have eY : Y = ∅ := Finset.not_nonempty_iff_eq_empty.mp (fun e => he (Or.inr e))
      have ht : D ∅ ∅ true = true := by simpa [hr,hrp,hc,hcq,hH,Finset.singleton_inter] using (hA r c).symm.trans h
      cases b <;> simp [eX,eY,hD,ht]
