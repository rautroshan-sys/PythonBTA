# P.3 — The Dot Product

**Series:** Neural Networks from Scratch (sentdex)
**Playlist:** https://www.youtube.com/playlist?list=PLQVvvaa0QuDcjD5BAw2DxE6OF2tius3V3

## What this part covers
Replaces the manual neuron/layer math from P.1–P.2 with the **dot product**, and introduces NumPy for vectorized computation.

## Key points
- A **vector** is an ordered list of numbers (e.g., a set of inputs or a set of weights).
- The **dot product** of two equal-length vectors = sum of the element-wise products.
  `dot(a, b) = a1*b1 + a2*b2 + ... + an*bn`
- A single neuron's weighted sum is *exactly* a dot product of the **inputs vector** and the **weights vector**, plus the bias.
- For a layer, this becomes a dot product between the **inputs vector** and a **matrix of weights** (one row/column per neuron), producing the full output vector in one operation.
- **NumPy** (`np.dot`) is introduced here because it performs this operation far faster and more concisely than manual Python loops.
- Correct **vector/matrix orientation** matters — dot product requires the inner dimensions to match, which becomes especially important once batches (P.4) are introduced.

## Why it matters
The dot product is the single most repeated operation in this entire series — every layer's forward pass, from here through backpropagation, is built on it.

## Gaps to watch for
- Treating the dot product as just "a shortcut" rather than understanding it *is* the neuron/layer math from P.1–P.2 — same result, different notation.
- Not yet grasping how dot product generalizes from vector·vector to matrix·vector (needed before P.4's batches).