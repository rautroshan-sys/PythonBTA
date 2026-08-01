# P.1 — Intro and Neuron Code

**Series:** Neural Networks from Scratch (sentdex)
**Playlist:** https://www.youtube.com/playlist?list=PLQVvvaa0QuDcjD5BAw2DxE6OF2tius3V3

## What this part covers
Introduces the motivation for building neural networks without relying on frameworks (TensorFlow/PyTorch), then codes the math behind a single neuron by hand.

## Key points
- A **neural network** is built from layers of interconnected neurons; understanding the raw math first makes frameworks easier to reason about later.
- A single **neuron** receives one or more **inputs**, each paired with a **weight**, plus one **bias**.
- Neuron output formula (single neuron, 3 inputs):
  `output = (input1*weight1) + (input2*weight2) + (input3*weight3) + bias`
- **Weights** scale the importance/influence of each input signal.
- **Bias** shifts the output independently of the inputs — lets the neuron activate even when inputs are small or zero.
- Every neuron has **one bias**, but **one weight per input connection**.
- At this stage, everything is done with plain Python (no NumPy yet) to build intuition before introducing vectorized operations.

## Why it matters
This is the atomic building block — every later concept (layers, batches, activation functions) is just this same computation repeated and scaled up.

## Gaps to watch for
- Confusing "weight" (per-connection) with "bias" (per-neuron) — a very common early mix-up.
- Not yet understanding *why* weights/biases are learned values, not fixed constants (that comes with training/optimization later, P.9+).