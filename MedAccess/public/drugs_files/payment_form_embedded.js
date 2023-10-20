// check if PayU embedded or not when loading the form
setTimeout(
  function(){
    var cardFormEmbeded = document.body.classList.contains('isEmbed');
    var formEmbeded = window.self !== window.top;
    if ( cardFormEmbeded === true || window.self !== window.top ) {
      $$('.jotform-form')[0].insert(
        new Element('input', {
          id: 'payment_form_embedded',
          type: 'hidden',
          name: 'payment_form_embedded',
          value: 'true'
        })
      );
    }
  }, 200 );




