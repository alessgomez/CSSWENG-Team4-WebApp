$(document).ready(function(){

    
    // delete application
    $("#delete").click(function(){
        console.log("clicked");
        //router.delete('/applications/delete/:id', getApplication, async (req, res) => {
        //$.get('/getAddOn', {name: name}, function(result)  {
        const applicationNo = parseInt($("#refno").text());
        console.log("applicationNo: " + applicationNo);

        $.ajax({ 
            url: '/admin/applications/delete/' + applicationNo,
            type: 'delete',
            success: function() {
                // your success response data here in data variable
                console.log('successfully deleted');
            }
        });          
          
        window.location.href="http://localhost:3000/admin/applications";

    });

    $("#backBtn").click(function()  {
        window.location.href="http://localhost:3000/admin/applications";
    });

    // update stage based on dropdown
    $("#filter-options").change(function(){
     
    });
    
    
 });