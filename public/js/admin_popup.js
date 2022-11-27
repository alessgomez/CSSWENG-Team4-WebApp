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
        const newStage = $("#status").html();
        
        $.ajax({
            contentType: 'application/json',
            url: '/admin/updatestatus/' + applicationNo,
            type: 'patch',
            dataType: 'json',
            data: JSON.stringify({"newStatus": newStage}),
            success: function() {
                // your success response data here in data variable
                console.log('successfully updated status');
            }
        });
        
        $("#saved").text("Successfully updated status!");
    });
 });