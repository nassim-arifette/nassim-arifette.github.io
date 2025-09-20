---
title: "Projection Convexe pour Garantir l'Inégalité Triangulaire (Bachelor’s Report)"
excerpt: "Intégration d’une projection sur le cône métrique dans Phyloformer pour garantir la métricité des distances phylogénétiques."
collection: portfolio
permalink: /portfolio/bachelor-projection-metric-phyloformer/
date: 2023-07-02
---

**Rapport de Bachelor (PDF):**  
**[Télécharger le rapport](/files/bachelor_report_metric_projection_phyloformer.pdf){: .btn .btn--primary}**  

# Projection Convexe pour Garantir l’Inégalité Triangulaire dans Phyloformer

**Institution** : Collège de France – CIRB, Équipe « Ecology & Evolution of Health »  
**Programme** : Licence (Bachelor)  
**Auteur** : Nassim Arifette  
**Encadrant** : Laurent Jacob  
**Période** : Jusqu’en juillet 2023  

## Vue d’ensemble du projet

Ce travail présente une méthode pour intégrer, **pendant l’entraînement d’un Transformer phylogénétique** (Phyloformer), une **projection convexe** sur le **cône métrique** afin de garantir que les matrices de distances prédites respectent toujours l’**inégalité triangulaire**. Nous comparons le modèle de base et la version « metric-nearness » via des métriques de perte L1 et de qualité topologique (distance RF).

---

## Contexte & Motivation

- **Phylogénie** : reconstruction rapide d’arbres évolutifs à partir d’alignements de séquences multiples (MSA).  
- **Transformers** comme Phyloformer offrent de la vitesse, mais leurs sorties n’assurent pas la cohérence métrique (violations possibles de l’inégalité triangulaire).  
- **Importance** : des distances métriques garantissent la stabilité des algorithmes de reconstruction d’arbres (Neighbor-Joining) et l’interprétabilité des résultats.

---

## Données & Matériel

- **Dataset** : 1 000 séquences génétiques, distances de référence calculées par une méthode classique.  
- **Infrastructure** : GPU Nvidia Tesla V100 (32 Go), 30 min par configuration.  
- **Paramètres** :  
  - Époques : 20  
  - Learning rates : 1e-3 → 1e-6  
  - Batch size : 8  
  - Optimiseur : Adam  
  - Projection : 1 itération de Dykstra‐like par batch  

---

## Méthode

1. **Prédiction** :  $\hat{D} = f_{\theta}(X)$, matrice symétrique, diag zéro  
2. **Projection** : $ \tilde{D} = \Proj_{\Mcone}(\hat{D}) $ via un algorithme de proximité métrique  ℓ₂ (variante Brickell et al.)  
3. **Calcul de perte** : $ \mathcal{L} = \|\,\tilde{D}-D^\star\|_1 $  
4. **Mise à jour** : descente de gradient sans rétroprop à travers la projection  

---

## Résultats clés

| Métrique                   | Sans projection      | Avec projection        |
|----------------------------|----------------------|------------------------|
| Violations triangulaire    | Possibles            | Aucune                 |
| Perte L1 finale            | Plus faible          | Légèrement plus élevée |
| Distance RF normalisée     | ~0.15                | ~0.16                  |
| Erreur relative moyenne    | ~0.08                | ~0.09                  |

- **Projection** : élimine strictement toutes les violations métriques.  
- **Impact topologique** : quasi-nul sur la qualité RF des arbres NJ (differences < 1 %).  
- **Trade-off** : légère hausse de la perte L1, mais matrices désormais théoriquement cohérentes.

---

## Limitations

- **Convergence** : entraînement limité à 20 époques.  
- **Un seul dataset** : généralisation non évaluée sur d’autres alignements.  
---

## Recommandations pratiques

- Pour des **analyses requérant des distances métriques** (clustering, MDS, NJ), **ajouter une projection** en post-processing ou pendant l’entraînement.  
- Ajuster le **nombre d’itérations de projection** (ℓ₁ vs ℓ₂) selon le budget de calcul.  
- En cas de **gros MSA (> 1 000 séquences)**, étudier des heuristiques ou sous-échantillonnages pour réduire $O(n^3)$ des contraintes.

---

## Perspectives & travaux futurs

1. **Projection à l’inférence** uniquement, pour comparer coût/avantage.  
2. **Entraînements plus longs** et multi-graines pour estimer la variance.  
3. **Étendre aux normes ℓ₁, pondérées**, ou à des contraintes additionnelles (ultramétrie).  
4. **Publication du code** et benchmark sur d’autres référentiels phylogénétiques publics.

---

### Mots-clés

Phyloformer · Projection convexe · Cône métrique · Inégalité triangulaire · Proximité métrique · Dykstra · Apprentissage profond · Distances phylogénétiques · Neighbor-Joining · Robinson–Foulds
