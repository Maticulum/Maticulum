# Maticulum

## Contributeurs

- [Anthony](https://github.com/anthonyC77)
- [Cédric](https://github.com/Frenchain)
- [Philippe](https://github.com/pgonday)
- [Xavier](https://github.com/Wisevax)


# Projet et concept

Un projet qui permet de fabriquer ou charger des diplômes en les enregistrant comme NFT au format ERC721.
Ce projet permet aussi de gérer tout le processus de création d'écoles et de formation.
Ainsi la validation du diplôme se fait par un jury.
  
# Installation

- Installer npm
- Cloner le repository github:
```
git clone https://github.com/Maticulum/Maticulum.git
cd Maticulum
```
- Installer les dépendances pour le backend:
```
npm install
```
- Installer les dépendances pour le frontend:
```
npm --prefix client/ install
```
 	
# Configuration

Renommer le fichier .env.template en .env, et renseigner les paramètres (seed de test, clé infura) avec les vôtres:
```
MNEMONICS=...
INFURA_API_KEY=...
```

# Déploiement

## Déploiement local

```
truffle deploy --network develop
```

## Déploiement réseau de test

```
truffle deploy --network rinkeby
truffle deploy --network mumbai
```

# Exécution

## Exécution 

### En local via ganache
```
npm run start:local
```
### En local via rinkeby
```
npm run startRinkeby
```
