## Tests unitaires pour MaticulumNFT
* Tests des cas nominaux
  - Création d'un ou plusieurs NFT avec le user qui a le droit school admin
  et un diplôme validé par des jurys
  - Récupération des données du NFT créé
  - Modification et récupération des données de passerelle
  - Modification et récupération des données du NFT : name, symbol
  
* Tests de sécurité 
  - ne pas pouvoir créé deux NFTs avec le même hash
  - ne pas pouvoir créé un NFT avec un hash invalide
  - lever une erreur si on recherche un NFT avec une uri inexistante 
  - lever une erreur si on tente de créer plus de 200 NFTs en une transaction

## Tests unitaires pour Maticulum
* Tests des cas nominaux
  - Création d'un ou plusieurs utilisateurs avec un hash chiffré et un rôle
  - Vérifier si l'utilisateur a le rôle admin
  - Vérifier si l'utilisateur est enregistré
  - Récupérer le rôle ou le hash de l'utilisateur enregistré
  
* Tests de sécurité
  - Lever une erreur si on tente de créer plus de 200 utilisateurs en une transaction
  - Lever une erreur si on tente de un utilisateur avec un hash 
  d'une longueur supérieure à 1000


## Tests unitaires pour MaticulumSchool
* Tests des cas nominaux
  - ajout d'une école
  - validation d'un administrateur école par un administrateur Maticulum
  - mise à jour d'une école
* Tests de sécurité
  - test d'accès par différents profils
  - la création d'une école doit être accompagnée du paiement

## Tests unitaires pour MaticulumTraining
* Tests des cas nominaux
  - ajout d'une formation
  - validation du ou des jurys par un administrateur école
  - validation du diplome par un ou des jurys
* Tests de sécurité
  - test d'accès par différents profils
  - time lock de la durée de la formation pour la validation du diplome
