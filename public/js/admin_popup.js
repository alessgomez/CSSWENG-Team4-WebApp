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
        $("#saved").text("")

        if (stage == "Pending Surveyor Visit" || stage == "Pending Installation") {
            $("#saveBtn").prop("disabled", true)
            $("#saveBtn").css("background-color", "gray")
            $("#dateAndTime").show()
            
            $("#inputDate").change(function() {
                if ($("#inputDate").val() && $("#inputTime").val()) {
                    $("#saveBtn").prop("disabled", false)
                    $("#saveBtn").css("background-color", "#000080")
                }
            })

            $("#inputTime").change(function() {
                if ($("#inputDate").val() && $("#inputTime").val()) {
                    $("#saveBtn").prop("disabled", false)
                    $("#saveBtn").css("background-color", "#000080")
                }
            })
        }
        else {
            $("#saveBtn").prop("disabled", false)
            $("#saveBtn").css("background-color", "#000080")
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

        window.location.href="http://localhost:3000/admin/applications";
    });
 });