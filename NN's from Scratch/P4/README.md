# P.4 — Batches, Layers, and Objects

**Series:** Neural Networks from Scratch (sentdex)
**Playlist:** https://www.youtube.com/playlist?list=PLQVvvaa0QuDcjD5BAw2DxE6OF2tius3V3

## What this part covers
Introduces processing data in **batches** rather than one sample at a time, and refactors layer logic into a reusable **object/class** (`Layer_Dense`).

## Key points
- A **batch** is a group of samples fed through the network together, instead of one at a time.
- Reasons to use batches:
  - **Speed** — matrix operations on batches are more efficient than looping sample-by-sample.
  - **Generalization** — computing adjustments (later, in training) over multiple samples at once helps the network fit patterns rather than overfitting to a single example's noise.
- Batches turn the inputs from a single vector into a **matrix** (rows = samples, columns = features).
- Matrix multiplication between inputs and weights now requires attention to **shape compatibility** — the weights matrix must be **transposed** so inner dimensions align.
- A common practical bug at this stage: **shape errors** from mismatched dimensions — understanding *why* the transpose is needed prevents this.
- Layers are refactored into a **class** (e.g., `Layer_Dense`) so a layer can be instantiated with `(n_inputs, n_neurons)` and reused across the network instead of hand-coding each layer.
- Typical initialization inside the class:
  - Weights: small random values (keeps early outputs from becoming too large before training).
  - Biases: initialized to zero.

## Why it matters
This is where the code stops being a one-off script and starts becoming a reusable framework — the `Layer_Dense` object pattern is reused for the rest of the series.

## Gaps to watch for
- Not understanding *why* the weights matrix needs transposing (shape mismatch is a symptom, not the root cause).
- Treating "batch" as just a performance trick rather than also a generalization/training concept.
- Hardcoding weight/bias initialization instead of understanding why small random weights + zero biases is a sensible default.