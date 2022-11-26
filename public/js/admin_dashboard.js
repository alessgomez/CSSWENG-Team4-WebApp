$(document).ready(function(){

    
   $("#filter-options").change(function(){
    var stage = $("#filter-options").val();

    console.log("stage in js: " + stage);

    if (stage == "")
        window.location.href="http://localhost:3000/admin/applications";
    else
    {
        window.location.href="http://localhost:3000/admin/filter?stage=" + stage;    
    }
    /*
    $.get('/admin/filter', {stage: stage}, function(result){

    });*/
   }) 
});