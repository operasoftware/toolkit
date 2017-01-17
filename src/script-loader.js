loadComponent = componentPath => {
  return new Promise(resolve => {
     const script = document.createElement('script');
     script.src = getFilePath(componentPath);
     script.setAttribute('data-component-path', componentPath);
     script.onload = () => {
       // window.registry.set(componentPath, window.lastExport);
       resolve(window.lastExport);
     };
     document.head.appendChild(script);
 });
};
