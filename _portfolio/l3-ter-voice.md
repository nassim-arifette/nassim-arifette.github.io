---
title: "Voiced/Unvoiced Classification in Speech (TER Report)"
excerpt: "Deep-learning vs. classic spectral features for frame-level voiced/unvoiced detection; experiments with MFCCs and Mel spectrograms on Paris-Saclay speech data."
collection: portfolio
permalink: /portfolio/ter-voiced-unvoiced/
date: 2023-05-03
---

**My TER Report (PDF):**  
**[Download the report](/files/ter_report_voiced_unvoiced.pdf){: .btn .btn--primary}**  

# Voiced/Unvoiced Classification: MFCC vs Mel Spectrogram CNNs

**Institution**: Université Paris-Saclay  
**Program**: TER (Travaux d’Étude et de Recherche)  
**Author**: Nassim Arifette  
**Mentor(s)**: Marc Evrard; with input from Albert Rillard and Saulo Santos  
**Period**: May 2023

## Project Overview

This work studies **frame-level voiced/unvoiced (V/UV) classification** in speech, comparing **MFCCs** against **Mel spectrograms** as inputs to a **Convolutional Neural Network (CNN)**.  
We evaluate **32/64/128 Mel bands** vs **20 MFCC coefficients**, using **7-fold file-level cross-validation** on recordings from **three speakers**.

Why it matters: V/UV is a foundational step for **pitch (F0) tracking**, **ASR**, **TTS**, and **speaker analysis**. Accurate V/UV improves downstream reliability by avoiding false F0 in unvoiced regions and stabilizing pitch tracking in voiced segments.

---

## Research Context & Motivation

- **Voiced** sounds exhibit **periodic** vocal-fold vibration and measurable F0; **unvoiced** are **aperiodic** (e.g., fricatives like /s/).
- Traditional features (energy, **ZCR**, autocorrelation) can be brittle to noise or breathy phonation.
- **MFCCs** capture spectral envelope cues aligned with voicing; **Mel spectrograms** preserve fine harmonic patterns that CNNs can learn—if data/model capacity suffice.

---

## Data & Features

- **Speakers**: 3  
- **Frame analysis**: **25 ms** Hann window, **10 ms** hop, **16 kHz** sampling  
- **Labeling**: Frame-level V/UV; windows labeled by **center frame**  
- **Sliding window context**: **50 frames** (≈500 ms), **50% overlap**  
- **Feature sets**:
  - **MFCC (20 coeffs, no C₀)**, lifter 22, per-utterance **CMVN**
  - **Mel spectrograms** with **32/64/128** bands (0–8 kHz), log-compressed in **dB** (10·log₁₀)
- **Auxiliary cues in source dataset**: HNR, CPPS, intensity, spectral emphasis; used in analysis/discussion

> **CV protocol**: **7-fold, by file** (never splitting a file). With only 3 speakers, this assesses **within-speaker** generalization; **speaker-disjoint** evaluation is left for future work.

---

## Methods

- **Architecture**: 2× Conv(3×3, ReLU) → MaxPool(2×2) → Dropout(0.4) → Flatten → Dense(128, ReLU) → Dense(1, Sigmoid)
- **Threshold**: 0.5 (tuning on a dev set could improve F1/BA)
- **Optimization**: Adam (1e−4), **Binary Cross-Entropy**, batch 32, **Early Stopping** (patience 5)
- **Tuning**: Keras Tuner **Hyperband** over dropout {0, .2, .4, .6}, LR {1e−3, 1e−4}, label smoothing {0, .1}
- **Reproducibility**: Fixed random seed; train/val windows never cross files

---

## Key Quantitative Findings

**Validation performance (mean over 7 file-level folds):**

| Feature Set | Val. Acc. ↑ | Val. Loss ↓ | Balanced Acc. ↑ |
|---|---:|---:|---:|
| **MFCC (20)** | **85.2** | **0.40** | **84.8** |
| Mel-32 | 81.3 | 0.41 | 80.9 |
| Mel-64 | 81.5 | 0.42 | 81.1 |
| Mel-128 | 81.8 | 0.43 | 81.4 |

**Highlights**
- **MFCCs outperform Mel spectrograms by ~3–4 pp** on validation accuracy and balanced accuracy.
- Increasing Mel bands **raises training accuracy** but **does not improve validation** → **overfitting increases** with dimensionality.
- With this dataset size and simple CNN, **MFCCs** offer a more compact, voicing-aligned representation.

> **Balanced Accuracy (BA)** = average of per-class recalls (voiced & unvoiced).

---

## Qualitative Insights

- **Error patterns**: Unvoiced **/s/** often flagged as voiced (strong HF energy); breathy/whispered vowels sometimes flagged unvoiced (low HNR).  
  HNR/CPPS help *explain* these cases by quantifying periodicity.
- **Boundaries**: V/UV transition frames are hardest; **soft labels** or **excluding ±1–2 frames** could help.
- **Protocol clarity**: File-level CV avoids file leakage but **not** speaker leakage; expand to **LOSO** for cross-speaker claims.

---

## Limitations

- **3 speakers** → limited generalization; no **speaker-disjoint** CV
- **Class imbalance** (voiced > unvoiced) unaddressed (no class weighting)
- **Baselines** absent: no direct comparison to **energy+ZCR** or **autocorrelation** rules
- **Metrics**: Accuracy-centric; add **precision/recall**, **F1**, **ROC/PR-AUC**, confusion matrices

---

## Practical Recommendations

- **Small data** or simple CNNs: prefer **MFCCs** (compact, voicing-aligned)
- **Mel spectrograms** may need **more data**, **richer CNNs**, and **regularization** (batch norm, L2, augmentation) to realize benefits
- Tune **decision threshold** on a dev set for task-specific trade-offs (F1 vs. BA)

---

## Potential Improvements (Future Work)

1. **Modeling**: LSTMs / GRUs; **Transformers** (HuBERT, wav2vec 2.0) for richer temporal context  
2. **Regularization**: BatchNorm after convs; small **L2**; **global average pooling** instead of flatten  
3. **Features**: Add **Δ / ΔΔ** to MFCCs; combine **MFCC + HNR + CPPS**  
4. **Augmentation**: **Time masking**, **additive noise**, small **time warps**  
5. **Evaluation**: **LOSO** or more speakers; robust thresholding; error analyses by phoneme class  
6. **Baselines**: Energy+ZCR and autocorrelation heuristics for context

---

## Technical Notes

- **Stack**: Python, TensorFlow/Keras, Keras Tuner, scikit-learn, librosa  
- **Signal params**: 25 ms / 10 ms, 16 kHz, Mel range 0–8 kHz, log-**dB** compression  
- **Training**: Early stopping; fixed seed; windows never cross files

---

## References (selection from report)

- Hillenbrand et al., **Acoustic correlates of breathy voice**  
- Slaney, **Auditory Toolbox** (Mel filterbank)  
- Kingma & Ba, **Adam**  
- Hsu et al., **HuBERT**; Baevski et al., **wav2vec 2.0**

---

### Keywords
Voiced/Unvoiced Detection, MFCC, Mel Spectrogram, CNN, Speech Processing, Pitch Tracking, HNR, CPPS, Cross-Validation, Overfitting

---

*This TER report provides a careful, reproducible comparison of MFCCs and Mel spectrograms for V/UV detection, and outlines a pragmatic roadmap for scaling beyond small datasets and simple architectures.*
