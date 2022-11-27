$(document).ready(function(){
   $("#filter-options").click(function(){
    var stage = $("#filter-options").val();

    $.get('/admin/filter', {stage: stage}, function(html){
       $("#applications-table").empty();
       $("#stageheader").text(stage);
       $("#applications-table").append(html);
    });
   });

   $('#search').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
      
      var search = $("#search").val();

      $.get('/admin/search', {search: search}, function(html) {
        $("#applications-table").empty();
        $("#stageheader").text("Search results for: " + search);
        $("#applications-table").append(html);
        $("#filter-options").val("all");
        $("#search").val("");
      })
    }
  });

});

