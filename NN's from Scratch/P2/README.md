# P.2 — Coding a Layer

**Series:** Neural Networks from Scratch (sentdex)
**Playlist:** https://www.youtube.com/playlist?list=PLQVvvaa0QuDcjD5BAw2DxE6OF2tius3V3

## What this part covers
Expands from a single neuron to a **layer** of neurons, all receiving the same set of inputs but each with its own unique weights and bias.

## Key points
- A **layer** = a group of neurons operating on the same input data simultaneously.
- Each neuron in the layer produces **one output value**, so a layer of *n* neurons produces a vector of *n* outputs.
- Every neuron needs its **own weight set** (one weight per input) and **its own bias** — weights are *not* shared across neurons in a layer.
- Manually writing out each neuron's calculation (as in P.1) becomes unmanageable as the number of neurons/inputs grows — this motivates the shift toward loops, and eventually the dot product (P.3).
- The **shape** of a layer's output is determined by the number of neurons, not the number of inputs.

## Why it matters
This is the first step toward "layers" as the core unit of a network, and exposes the scaling problem that vectorized math (NumPy) is introduced to solve.

## Gaps to watch for
- Assuming neurons in a layer share weights (they don't — only the *inputs* are shared).
- Losing track of which weight list belongs to which neuron when hand-coding — a sign the dot product/matrix approach is needed.