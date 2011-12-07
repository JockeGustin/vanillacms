// This file contains javascript that is specific to the VanillaCMS/settings controller.
jQuery(document).ready(function($) {

   //PageMeta
   $('#MetaKeySelect').change(function() {  //Show/Hide Assets
      var id = $('#MetaKeySelect option:selected').val();
      
      if ($('#' + id + '_ShowAssets').val() == 'true') {
         $('.AssetShowHide').show();
      } else {
         $('.AssetShowHide').hide();
      };
      
      $('#MetaValueLabel').html($('#' + id + '_HelpText').val());

   });
   
   $('textarea#MetaValue').livequery(function() {
      $(this).autogrow();
   });

   $('a#NewMetaSubmit').live('click', function() {//Submit new PageMeta
      $('#MetaAjaxResponse').empty();
      var key = $('#MetaKeySelect option:selected').val();
      var keyname = $('#MetaKeySelect option:selected').html();
      var asset = '';
      var assetname = '';
      if ($('#MetaKeySelect option:selected').hasClass('ShowAsset')) {
         asset = $('#MetaAssetSelect option:selected').val();
         assetname = $('#MetaAssetSelect option:selected').html();
      }
      var value = $('#MetaValue').val().trim();

      if (key == '' || keyname == '') {
         $('<p class="Alert"></p>').html("Du måste ange ett värde").appendTo('#MetaAjaxResponse');
      }
      else {
         $('<tr><td>'+keyname+'<a href="deletemeta" class="DeleteMeta">[Ta bort]</a><input type="hidden" id="Form_MetaKey[ ]" name="Page/MetaKey[ ]" value="'+key+'|'+keyname+'|'+value+'|'+asset+'|'+assetname+'" /></td><td>'+assetname+'</td><td>'+value+'</td></tr>').appendTo('#TheList');
         $('#MetaList').show();
         $('#MetaList').effect("highlight", {}, 1000);
      }  
   });

   $('a.EditMeta').live('click', function() {
      var MetaArray = $(this).next('input').val().split('|');
      $('#MetaValue').val(MetaArray[2]);
      $('#MetaKeySelect option[value='+MetaArray[0]+']').attr('selected', 'selected');

      if ($('#MetaKeySelect option:selected').hasClass('ShowAsset')) {
         $('.AssetShowHide').show();
         $('#MetaAssetSelect option[value='+MetaArray[3]+']').attr('selected', 'selected');
      } else {
         $('.AssetShowHide').hide();
      }
      $(this).parents('tr').remove();
      $('#NewMeta').effect("highlight", {}, 2700);
      return false;
   });

   $('a.DeleteMeta').popup({
      confirm: true,
      followConfirm: false,
      afterConfirm: function(json, sender) {
         $(sender).parents('tr').remove();
      }
   });


   // Hijack "publish" or "save as draft" clicks and handle via ajax...
   $.fn.handlePageForm = function() {
      this.click(function() {
         var button = this;
         $(button).attr('disabled', 'disabled');
         $('#Form_UrlCode').val($('#ParentUrlCode').html() + $('#UrlCode').html())
         var frm = $(button).parents('form').get(0);
         var textbox = $(frm).find('textarea');
         var postValues = $(frm).serialize();
         postValues += '&DeliveryType=VIEW&DeliveryMethod=JSON'; // DELIVERY_TYPE_VIEW
         postValues += '&Page%2FStatus='+button.name;

         $(button).before('<span class="TinyProgress">&nbsp;</span>');
         $.ajax({
            type: "POST",
            url: $(frm).attr('action'),
            data: postValues,
            dataType: 'json',
            error: function(XMLHttpRequest, textStatus, errorThrown) {
               $('div.Popup').remove();
               $.popup({}, XMLHttpRequest.responseText);
            },
            success: function(json) {
               json = $.postParseJson(json);
                
               // Remove any old errors from the form
               $(frm).find('div.Errors').remove();
               
               if (json.FormSaved) {
                  gdn.inform(json);
               }
               
               //$('#Content').html(json.Data);
               $('span.Publish.Time').html(json.InformMessages['0']['Message'].substr(-7, 7));
               
               if (json.RedirectUrl)
                 setTimeout("document.location='" + json.RedirectUrl + "';", 300);
            },
            complete: function(XMLHttpRequest, textStatus) {
               //Update the visit link with proper href
               $('a#VisitLink').attr("href", gdn.definition('WebRoot') + '/' + $('#Form_UrlCode').val());

               var statusText = button.name.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                   return letter.toUpperCase();
               });

               $('.Publish.Status').html(statusText);
               
               // Remove any spinners, and re-enable buttons.
               $('span.TinyProgress').remove();
               $(frm).find(':submit').removeAttr("disabled");
            }
         });
         return false;
      
      });
   };
   $('#Form_Page :submit').handlePageForm();
   


   $('a.DeleteMessage').popup({
      confirm: true,
      followConfirm: false,
      afterConfirm: function(json, sender) {
         $(sender).parents('tr').remove();
      }
   });

   if ($.fn.alphanumeric) {
      $('#Form_UrlCode').alphanumeric({allow:"-"});
   }
   
   // Map plain text category to url code
   $("#Form_Name").keyup(function(event) {
      if ($('#Form_CodeIsDefined').val() == '0') {
         $('#UrlCodeContainer').show();
         var val = $(this).val().replace(/[ ]+/g, '-').replace(/[^a-z0-9\-]+/gi,'').toLowerCase();
         $("#Form_UrlCode").val(val);
         $("#UrlCode").text(val);
      }
   });
   // Make sure not to override any values set by the user.
   $('#UrlCode').text($('#Form_UrlCode').val());
   $("#Form_UrlCode").focus(function() {
      $('#Form_CodeIsDefined').val('1');
   });
   $('#Form_UrlCode, #UrlCodeContainer a.SaveUrlCode').hide();
   if ($('#Form_UrlCode').val() == '') {
      $('#UrlCodeContainer').hide();
   }
   
   // Reveal input when "change" button is clicked
   $('#UrlCodeContainer a.UrlToggle, #UrlCode').click(function() {
      $('#UrlCodeContainer').find('input,span,a').toggle();
      $('#UrlCode').text($('#Form_UrlCode').val());
      $('#Form_UrlCode').focus();
      return false;
   });
   
   //Hide the prompt text if input is clicked
   $("#Form_Name").click(function() {
      $("#NamePromtText").hide();
   });
   $("#Form_Quote").click(function() {
      $("#QuotePromtText").hide();
   });

   if(!$("#Form_Name").val()) {
      $("#NamePromtText").show();
   }
   if(!$("#Form_Quote").val()) {
      $("#QuotePromtText").show();
   }
       
   $( 'textarea.Editor' ).ckeditor({
      customConfig : gdn.definition('WebRoot') + '/applications/vanillacms/js/ckeditor/config.js',   
       filebrowserUploadUrl  :gdn.definition('WebRoot') + '/applications/vanillacms/js/ckeditor/kcfinder/upload.php?type=files',
       filebrowserImageUploadUrl : gdn.definition('WebRoot') + '/applications/vanillacms/js/ckeditor/kcfinder/upload.php?type=images',
      filebrowserBrowseUrl :gdn.definition('WebRoot') + '/applications/vanillacms/js/ckeditor/kcfinder/browse.php?type=files',
       filebrowserImageBrowseUrl : gdn.definition('WebRoot') + '/applications/vanillacms/js/ckeditor/kcfinder/browse.php?type=images',
   });

   $('#Form_ParentPageID').change(function() {
      var ParentUrl = $('#Form_ParentPageID option:selected').data('url');

      $('#ParentUrlCode').html(ParentUrl);
      
      if ($('#Form_ParentPageID option:selected').val() > 0) {
         $('#ParentUrlCode').html($('#ParentUrlCode').html() + '/')
      }
         
      $('#UrlCodeContainer').effect("highlight", {}, 1000);

   });
});