---
title: "Voiced/Unvoiced Classification in Speech (TER Report)"
excerpt: "I pitted MFCCs against Mel spectrograms for frame-level voiced/unvoiced detection. On small data, compact cepstra beat pretty pictures."
collection: portfolio
permalink: /portfolio/ter-voiced-unvoiced/
date: 2023-05-03
---

**My TER Report (PDF):**  
**[Download the report](/files/ter_report_voiced_unvoiced.pdf){: .btn .btn--primary}**

# Voiced/Unvoiced, Told as a Short Story

When you say “zebra,” the **/z/** rides on vibrating vocal folds (voiced) while the **/s/** in “snake” is all hiss (unvoiced). Lots of tools—pitch trackers, ASR, TTS—work better if we can flip a tiny frame-level switch: **voiced or unvoiced**.  

For my TER, I set myself a practical question:

> **With modest data and a small CNN, is it smarter to feed the model compact MFCCs or full Mel spectrograms?**

I had **three speakers** recorded at **16 kHz**. I chopped audio into **25 ms frames** (10 ms hop), and built input windows of ~**0.5 s** (50 frames). To avoid any train/val bleed, I used **7-fold cross-validation by file** (no file ever split).

---

## Why I Thought Mel Might Win (…and Why It Didn’t)

Mel spectrograms are like a high-res photo of time-frequency structure; they keep fine **harmonic patterns** that seem perfect for detecting voicing. MFCCs, meanwhile, compress the spectrum down to a handful of coefficients—a tidy **spectral envelope**.

I tried both in the **same lightweight CNN** (two conv blocks → max-pool → dropout → dense). I tuned learning rate and dropout a bit (Adam, early stopping). Nothing fancy on purpose: I wanted to see which **representation** helps most when the model and data are small.

**Results (validation, mean over 7 file-level folds):**

| Input                 | Acc. ↑ | Balanced Acc. ↑ |
|----------------------|:------:|:----------------:|
| **MFCC (20 coeffs)** | **≈85%** | **≈85%**         |
| Mel-32               | ≈81%   | ≈81%             |
| Mel-64               | ≈81%   | ≈81%             |
| Mel-128              | ≈82%   | ≈81%             |

**MFCCs won by ~3–4 points.** Increasing Mel bands raised **training** accuracy but didn’t lift **validation**—a neat example of **overfitting** when you add dimensionality without adding data or model capacity.

---

## What I Learned

- **Small data loves compact features.** MFCCs funnel the cues that matter for voicing (periodicity/spectral envelope) into a size the CNN can actually digest.  
- **Boundaries are hard.** Frames at voiced↔unvoiced transitions confused the model most; soft labels or ignoring ±1–2 frames could help.  
- **Typical mistakes made sense.** Strong high-frequency **/s/** sometimes looked “voiced”; breathy/low-HNR vowels sometimes looked “unvoiced.” Adding **HNR/CPPS** features would likely reduce both errors.  
- **Protocol matters.** File-level CV avoids leakage across segments of the same file, but it’s still **within-speaker**. A future **leave-one-speaker-out** pass would test cross-speaker generalization properly.

---

## If I Had Another Week

- Add **Δ/ΔΔ** to MFCCs and/or combine MFCC + **HNR/CPPS**.  
- Use a slightly richer head (BatchNorm, **global average pooling**, tiny L2).  
- Try **threshold tuning** (0.5 isn’t sacred) for better F1 or balanced accuracy.  
- Do **speaker-disjoint** evaluation and light **augmentation** (time masking, mild noise).

---

## Takeaway

If you’re building a **frame-level voiced/unvoiced** switch with **limited data and a small CNN**, start with **MFCCs**. They’re the right abstraction at the right scale. Mel spectrograms can surpass them—but usually when you also scale **data**, **model**, and **regularization**.

---

**Tech stack:** Python, TensorFlow/Keras, scikit-learn, librosa · 25 ms / 10 ms · 16 kHz  
**People:** TER @ Université Paris-Saclay · Mentor: Marc Evrard · With input from Albert Rillard & Saulo Santos

**[Read the full report (PDF)](/files/ter_report_voiced_unvoiced.pdf){: .btn .btn--primary}**
