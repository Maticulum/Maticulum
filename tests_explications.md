Raisons des tests unitaires sur le smart contract MaticulumNFT :

S'assurer qu'on ne puisse envoyer 2 fois le même hash pour créer l'URL vers le fichier JSON.
A la fois via plusieurs envois ou dans le même envoi.
Dans le cas de doublon la transaction est annulée.
Dans ce cas l'error "Hash already minted" est levée.

Un hash a un format particulier avec une longueur précise, c'est celui que renvoie Pinata quand il stoke un fichier sur IPFS.
Si elle n'est pas respectée une erreur est levée : "Invalid hash length"
Le but est de s'assurer qu'il n'y a pas autre chose que des hash stockés dans le smart contract.

La gateway est aussi stockée dans la blockchain, elle permet d'accèder à Pinata pour aller chercher le fichier JSON qui contient le lien vers l'image.
Elle peut être modifiée.
Nous testons la valeur initiale de cette URL.
Nous testons aussi sa modification éventuelle.

Pour rechercher un hash nous utilisons une méthode.
Si le hash n'existe pas nous retournons l'erreur "Uri not yet stored"

Les Urls des API PInata sont aussi stockés dans le cas où on voudrait changer d'API.
Nous testons également les valeurs par défaut et leur changement éventuel.

De la même façon les données concernant le NFT, nom, symbôle et hash de l'adresse de l'image dans Metamask
sont stockés dans le smart contract.
Nous testons si ces valeurs correspondent à celles attendues.

Enfin nous testons le nombre de hash envoyés et leur valeurset nous récupérons la valeur des URIs.


