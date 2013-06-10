var scripts = document.getElementsByTagName('script');
for(var i=0; i < scripts.length; i++){
  var dataMain = scripts[i].getAttribute('data-main');
  if(dataMain){
    require(dataMain);
    break;
  }
}
