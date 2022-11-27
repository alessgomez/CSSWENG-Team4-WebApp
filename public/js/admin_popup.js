$(document).ready(function(){

    
    // delete application
    $("#delete").click(function(){
       
        const applicationNo = parseInt($("#refno").text());

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
    $("#status-dropdown").change(function(){
        
        var stage = $("#status-dropdown").val();
        $("#status").text(stage);

    });

    $("#saveBtn").click(function() {

        const applicationNo = parseInt($("#refno").text());

        $.ajax({ 
            url: '/admin/applications/updatestatus/' + applicationNo,
            type: 'patch',
            success: function() {
                // your success response data here in data variable
                console.log('successfully updated status');
            }
        });
        
        //window.location.href="http://localhost:3000/admin/applications";

    });

    
    
 });