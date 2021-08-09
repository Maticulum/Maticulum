# Attaques connues

## Reentrancy

Non applicable car nos smart contracts n'ont pas de fonction withdraw ou transfer.

## Front-Running

Non applicable pour la même raison que ci-dessus.

## Timesamp manipulation

Un timelock est utilisé pour prévenir la validation d'un diplome avant la fin d'une formation.
Cependant la précision est largement supérieure à 15 secondes (Unité de base en heure), nous pouvons donc utiliser block.timestamp.

## Integer overflow and underflow

Nous utilisons une version de Solidity > 0.8, qui fait automatiquement un revert sur les opérations arithmétiques produisant un overflow/underflow.

## DoS with (Unexpected) revert

Non applicable car pas d'utilisation de send (pas d'envoi de tokens).

## DoS with Block Gas Limit

MaticulumNFT: Ajout d'un champ maxHashCount pour éviter les attaques de type Deny Of Service
Il n'est possible d'envoyer que 200 diplômes par transaction.

Maticulum: Ajout d'un champ maxUserstoRegister pour éviter les attaques de type Deny Of Service
Il n'est possible de créer que 200 utilisateurs par transaction

## Insufficient gas griefing

Non applicable car nous n'avons pas de fonction qui acceptent des datas génériques

## Forcibly Sending Ether to a Contract

Non applicable car nous n'utilisons pas de fonction withdraw ou send.


# Autres sécurités

## MaticulumNFT
AddNFTsToAdress
Utilisation de require pour la gestion du NFT 
pour empêcher d'envoyer deux fois le même hash.
Seul un admin école peut générer un NFT.
La méthode modifyGatewaysData est accessible seulement pour l'owner.
Elle permet de modifier les données de la passerelles Pinata.
Pour le NFT il est possible de changer l'image du token NFT.
Seul l'owner peut le faire via la méthode modifyHashToImageToken

## Maticulum
Gestion de modifier comme le onlyOwner du smart contract Ownable d'OpenZeppelin 
pour le smart contract Maticulum et de droits utilisateurs.

## MaticulumSchool
* Pour toutes les fonctions transactionnelles, le msg.sender est contrôlé suivant son profil:
  - super admin Maticulum
  - school admin pour une école définie

## MaticulumTraining
* Pour toutes les fonctions transactionnelles, le msg.sender est contrôlé suivant son profil:
  - super admin Maticulum
  - school admin pour une école définie
  - jury pour une formation définie
