## MaticulumNFT
AddNFTsToAdress
Utilisation de require pour la gestion du NFT 
pour empêcher d'envoyer deux fois le même hash.

## Maticulum
Gestion de modifier comme le onlyOwner du smart contract Ownable d'OpenZeppelin 
pour le smart contract Maticulum et de droits utilisateurs.

## MaticulumSchool
* Pour toutes les fonctions transactionnelles, le msg.sender est contrôlé suivant son profil:
  - super admin Maticulum
  - school admin pour une école définie
* utilisation du nonReentrant pour le paiement des frais d'inscription lors de la création d'une école

## MaticulumTraining
* Pour toutes les fonctions transactionnelles, le msg.sender est contrôlé suivant son profil:
  - super admin Maticulum
  - school admin pour une école définie
  - jury pour une formation définie
