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
          
        window.location.href="/admin/applications";

    });

    $("#backBtn").click(function()  {
        window.location.href="/admin/applications";
    });

    // update stage based on dropdown
    $("#status-dropdown").change(function(){
        var stage = $("#status-dropdown").val();
        var stageColor;

        $("#status").text(stage);
        $("#saved").text("")

        switch (stage) {
            case 'Uploading Requirements': stageColor = 'teal'; 
            break;
            
            case 'Adding Representative': stageColor = '#DAA520';
            break;
            
            case 'Printing and Preparing Documents': stageColor = 'purple';
            break;
            
            case 'Waiting for Survey Schedule': stageColor = '#B80000';
            break;
            
            case 'Pending Surveyor Visit': stageColor = '#7B3F00';
            break;

            case 'Purchasing of Materials': stageColor = '#db7093';
            break;

            case 'Pending Onsite Visit': stageColor = '#FF8C00';
            break;

            case 'Pending Installation': stageColor = 'blue';
            break;

            case 'Completed': stageColor = 'green';
            break;
        }

        $("#status").css({"background": stageColor});


        if (stage == "Pending Surveyor Visit" || stage == "Pending Installation") {
            $("#saveBtn").prop("disabled", true)
            $("#saveBtn").css("background-color", "gray")
            $("#dateAndTime").show()
            
            $("#inputDate").change(function() {
                if ($("#inputDate").val() && $("#inputTime").val()) {
                    $("#saveBtn").prop("disabled", false)
                    $("#saveBtn").css("background-color", "#003366")
                }
            })

            $("#inputTime").change(function() {
                if ($("#inputDate").val() && $("#inputTime").val()) {
                    $("#saveBtn").prop("disabled", false)
                    $("#saveBtn").css("background-color", "#003366")
                }
            })
        }
        else {
            $("#saveBtn").prop("disabled", false)
            $("#saveBtn").css("background-color", "#003366")
            $("#dateAndTime").hide()
        }

        $("#inputDate").val("")
        $("#inputTime").val("")
    });

    $("#saveBtn").click(function() {

        const applicationNo = parseInt($("#refno").text());
        const newStage = $("#status").html();

        $("#saved").text("Successfully updated status!");

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
        })

        if (newStage == "Pending Surveyor Visit") {
            var date = $("#inputDate").val()
            var time = $("#inputTime").val()

            $.ajax({
                url: '/admin/surveyschedule/' + applicationNo,
                type: 'get',
                data: {date: date, time: time},
                success: function() {
                    // your success response data here in data variable
                    console.log('changed survey date');
                }
            })
        }

        if (newStage == "Pending Installation") {
            var date = $("#inputDate").val()
            var time = $("#inputTime").val()

            $.ajax({
                url: '/admin/installationschedule/' + applicationNo,
                type: 'get',
                data: {date: date, time: time},
                success: function() {
                    // your success response data here in data variable
                    console.log('changed installation date');
                }
            })
        }

        window.location.href="/admin/applications";
    });
 });