     
     $(document).ready(function(){
   $('#mylink').on('click', function(){
      // alert('onclick is working.');
      miniReport(); //Your function 
   });
});
   
   function miniReport(){
      console.log("err");                                                                                                                            
        $.ajax({
          url: 'http://localhost:3000/Dproject',
          type: 'get',
         dataType: 'html',
           // data: json,
          success: function(result){
            // alert(result);
            document.location.href = '/Dproject';
          }
        });
       }