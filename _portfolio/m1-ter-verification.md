---
title: "Verification Neural Network (Ongoing work)"
excerpt: "Master's thesis on abstraction-based verification of ReLU neural networks using zones and tropical geometry"
collection: portfolio
permalink: /portfolio/m1-ter-verification/
date: 2024-03-26
---
**Report** 

**[Report](/files/Verification_Neural_Network.pdf){: .btn .btn--primary}**

## Verification Neural Network

**Institution:** École Polytechnique, LIX  
**Degree:** Master's Thesis  
**Date:** March 26, 2024  
**Author:** Nassim Arifette  
**Supervisors:** Éric Goubault, Sylvie Putot

### Abstract

This thesis addresses a critical challenge in artificial intelligence: how can we guarantee that neural networks will behave safely and correctly, especially in life-critical applications? As neural networks become more prevalent in autonomous vehicles, medical diagnosis, and financial systems, we need mathematical methods to prove their reliability rather than just testing them empirically.

### The Problem

Neural networks are essentially black boxes that can make unpredictable decisions when faced with slightly modified inputs. For instance, a medical diagnostic system should give the same diagnosis whether an image is slightly brighter or darker. However, verifying this property for all possible inputs is computationally impossible since there are infinitely many possible variations.

### Our Approach

This work develops abstraction-based verification techniques that solve this problem by working with sets of inputs rather than individual data points. Instead of testing every possible image variation, we mathematically represent entire regions of similar inputs and verify properties over these regions simultaneously.

The thesis explores two complementary mathematical frameworks. The first approach uses zone analysis with difference bound matrices, which efficiently represent relationships between neural network variables using systems of linear inequalities. This method tracks how sets of inputs propagate through the network layers, maintaining mathematical guarantees about the network's behavior.

The second approach leverages tropical geometry, a mathematical framework where traditional arithmetic operations are replaced by max and addition operations. This perspective reveals that ReLU neural networks can be naturally expressed as tropical rational functions, providing new geometric insights into their decision boundaries and enabling more efficient verification algorithms.

### Technical Contributions

The zone-based verification method represents neural network states using difference bound matrices and implements optimal closure algorithms to tighten these representations. For linear layers, the work provides precise mathematical characterizations of how input regions transform through matrix operations. The ReLU activation function is handled through specialized approximation techniques that preserve verification guarantees.

The tropical geometry approach demonstrates that ReLU networks correspond to tropical rational functions, where decision boundaries align with tropical hypersurfaces. This connection enables the development of verification algorithms that exploit the geometric structure of these networks, potentially offering computational advantages over traditional methods.

### Practical Implementation

Both theoretical frameworks are implemented in Julia, providing practical tools for neural network verification. The implementations include efficient algorithms for zone closure, tropical arithmetic operations, and network forward propagation in the abstract domains.

### Impact and Applications

This verification methodology addresses safety concerns in autonomous vehicles where incorrect decisions could be fatal, medical diagnostic systems where misclassification affects patient care, and financial systems where algorithmic errors have economic consequences. The mathematical guarantees provided by these methods enable the deployment of neural networks in safety-critical applications with increased confidence.


### Keywords
Neural Network Verification, Abstraction-Based Verification, ReLU Networks, Tropical Geometry, Zone Analysis, Robustness, Safety-Critical AI