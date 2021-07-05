
# Bootstrap

Les composants de l'ihm sont des composants react-bootstrap: https://react-bootstrap.github.io/components/alerts


# Router

Utilisation de react-router pour la navigation: https://reactrouter.com/web/guides/quick-start
La classe utilisant Router doit s'exporter avec withRouter:
```javascript
export default withRouter(SchoolList);
```


# Context

Utilisation de context https://fr.reactjs.org/docs/context.html pour partager des "variables globales"
accessibles par 
```javascript
this.context
```


# i18n

Utilisation de https://react.i18next.com/

Les classes utilisant la traduction doivent avoir:

```javascript
export default withTranslation()(App);
```
au lieu de juste:
```javascript
export default App;
```

Dans le render, il faut utiliser:
```javascript
    const { t } = this.props;
    // ...
    {t('nav.schools')}
```

Et mettre à jour:
/client/public/locales/<langue>/translation.js
