# GenAnnotator


> Done with ChatGPT, must be reworked !!

# Annotation et Analyse Fonctionnelle de Génomes Bactériens

## Description du projet

Ce projet consiste en la création d'une application web permettant l'annotation et l'analyse fonctionnelle de génomes bactériens. L'outil est conçu pour gérer les annotations, les utilisateurs et les fonctionnalités spécifiques liées aux génomes procaryotes. 

Les utilisateurs peuvent effectuer des recherches, visualiser des génomes, annoter de nouvelles séquences et accéder à des banques de données externes. Ce projet s'adresse principalement à des biologistes computationnels travaillant avec des génomes bactériens.

---

## Fonctionnalités principales

1. **Gestion des utilisateurs et des rôles** :
   - Trois rôles : lecteur, annotateur et validateur.
   - Inscription des utilisateurs via un formulaire.
   - Création et gestion des utilisateurs par un administrateur.

2. **Recherche et visualisation** :
   - Formulaire avancé pour rechercher des génomes et séquences (nucléotidiques et peptidiques).
   - Visualisation des génomes avec positions des gènes, séquences et noms.

3. **Annotation des génomes** :
   - Annotation des séquences non annotées par des annotateurs.
   - Validation des annotations par des validateurs.
   - Gestion des annotations en cours et archivées.

4. **Comparaison et alignement de séquences** :
   - Lancement d'alignements à l'aide de l'API BLAST NCBI.

5. **Accès à des bases de données externes** :
   - Consultation des données complémentaires via des identifiants ou des mots-clés.

---

## Données disponibles

Les données incluent :
- **Génomes annotés** : E. coli (k12, CFT073, o157h7).
- **Nouveau génome** : E. coli (new_coli).
- Chaque génome est accompagné de fichiers :
  - Complet (.fasta)
  - Liste des CDS (_CDS)
  - Liste des peptides (_pep).

---

## Technologies utilisées

- **Frontend** : HTML, CSS, JavaScript (AJAX pour les fonctionnalités avancées).
- **Backend** : Python (Django) pour la gestion des utilisateurs, des annotations et des interactions avec les bases de données.
- **Base de données** : PostgreSQL pour stocker les génomes et annotations.
- **API externes** : BLAST NCBI pour les alignements de séquences.

---

## Installation et exécution

### Prérequis

- Python 3.8+
- Environnement virtuel `venv`
- PostgreSQL
- Téléchargement des données initiales (`data_web.zip` depuis eCampus)

### Étapes

1. **Cloner le projet** :
   ```
   git clone https://github.com/username/annotation-genomes.git
   cd annotation-genomes
   ```
2. **Configurer l'environnement** :
   
```
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

3. **Initialiser la base de données :**

```
python manage.py migrate
python manage.py loaddata initial_data.json
```

4. **Lancer le serveur :**
   
```
python manage.py runserver
```

5. **Accéder à l'application :**

Ouvrir un navigateur et accéder à `http://127.0.0.1:8000`.

## Options avancées

* Auto-complétion : Suggestions pour les noms de gènes et protéines.
* Forum des annotateurs : Messagerie interne pour discuter des annotations.
* Notifications par email : Alertes pour les nouvelles annotations ou validations.

## Structure du projet
* app/ : Code principal de l'application.
* data/ : Données initiales (génomes et annotations).
* templates/ : Fichiers HTML pour les pages de l'application.
* static/ : Fichiers CSS et JavaScript.

## Critères d'évaluation
* Documentation : 30%.
* Présentation orale : 30%.
* Qualité des fonctionnalités : 40%.
