## MaticulumNFT
AddNFTsToAdress
Utilisation de require pour la gestion du NFT 
pour empêcher d'envoyer deux fois le même hash.
Ajout d'un champ maxHashCount pour éviter les attaques de type Deny Of Service
Il n'est possible d'envoyer que 200 diplômes par transaction.
Seul un admin école peut générer un NFT.
La méthode modifyGatewaysData est accessible seulement pour l'owner.
Elle permet de modifier les données de la passerelles Pinata.
Pour le NFT il est possible de changer l'image du token NFT.
Seul l'owner peut le faire via la méthode modifyHashToImageToken

## Maticulum
Gestion de modifier comme le onlyOwner du smart contract Ownable d'OpenZeppelin 
pour le smart contract Maticulum et de droits utilisateurs.
Ajout d'un champ maxUserstoRegister pour éviter les attaques de type Deny Of Service
Il n'est possible de créer que 200 utilisateurs par transaction

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
