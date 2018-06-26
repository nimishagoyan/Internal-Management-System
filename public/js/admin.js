//for Invoicelist.....  
// $(document).ready(function() {
//     $('#cool').on('click', function() {

//         mini(); //Your function 
//     });
// });

// function mini() {
//     console.log("err");
//     $.ajax({
//         url: 'http://localhost:3000/Invoicelist',
//         type: 'get',
//         dataType: 'html',
//         // data: json,  
//         success: function(result) {
//             // alert(result);
//             document.location.href = '/Invoicelists';
//         }
//     });
// }

function xt() {
    // console.log("err");
    document.getElementsByClassName("ID").disabled = false;
    var inputs = document.getElementsByClassName('invoice');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = false;
    }
}

// testing
// $(document).ready(function()
// {
//   $("#clicko").on('click',function(){
//    alert();
//   });
// });




$(document).ready(function() {
    $(".list_data").on('click', function() {
        var currentRow = $(this).closest("tr");
        var col = currentRow.find("td:eq(1) input").val();
        var clientname1 = col;
        // alert(clientname);
        document.getElementById("clientname1").value = clientname1;
        var col2 = currentRow.find("td:eq(2) input").val();
        var projectname1 = col2;
        // alert(clientname);
        document.getElementById("projectname1").value = projectname1;
        var col3 = currentRow.find("td:eq(3) input").val();
        var date1 = col3;
        // alert(date1);
        document.getElementById("date1").value = date1;

        var col5 = currentRow.find("td:eq(4) input").val();
        var clientid1 = col5;
        // alert(clientid);
        document.getElementById("clientid1").value = clientid1;


    });
});


$(document).ready(function() {
    $(".save").on('click', function() {
        var clientname = document.getElementById('clientname1').value;
        // alert(clientname1);
        var projectname = document.getElementById('projectname1').value;
        // alert(projectname1);
        var date = document.getElementById('date1').value;
        // alert(date2);
        var clientid = document.getElementById('clientid1').value;
        // alert(clientid1);
        gt(clientname, projectname, date, clientid);
    });
});

function gt(clientname, projectname, date, clientid) {

    console.log(clientname);
    console.log(projectname);
    console.log(date);
    console.log(clientid);


    $.ajax({
        url: 'http://localhost:3000/Invoicelist',
        method: 'post',
        data: {

            clientname: clientname,
            projectname: projectname,
            date: date,
            clientid: clientid
        },

        // dataType: html',
        success: function(data) {
            // console.log(data);
            document.location.href = '/Invoicelists ';
            // $('#IDS').html(data);
        }
    });

}

// $(document).ready(function() {
//     $('#details').on('click', function() {
// $('button#create-task').on('click', function(){

// // remove nothing message
// if ('.nothing-message') {
//     $('.nothing-message').hide('slide',{direction:'left'},300)
// };
// alert('onclick is working.');
//         Report(); //Your function 
//     });
// });
// for projectdata...
// $(document).ready(function() {
//     $('#details').on('click', function() {
//      // alert('onclick is working.');
//         Report(); //Your function 
//     });
// });

// function Report() {
//     $(document).ready(function() {
//    $('button#create-task').on('click', function(){

//         // remove nothing message
//         if ('.nothing-message') {
//             $('.nothing-message').hide('slide',{direction:'left'},300)
//         }
// });
// console.log("err");
// $.ajax({
//     url: 'http://localhost:3000/task',
//     type: 'post',
//      dataType: 'html',
//     // data: json,
//     success: function(result) {
//         // alert(result);
//         document.location.href = '/Aprojectsdetails';
//     }
// });
// }
// }

function st() {
    // console.log("err");
    document.getElementsByClassName("ID").disabled = false;
    var inputs = document.getElementsByClassName('my-input-class');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = false;
    }
}




$(document).ready(function() {
    $(".table_data").on('click', function() {
        var currentRow = $(this).closest("tr");
        var col1 = currentRow.find("td:eq(0) input").val();
        var projectname1 = col1;
         alert(projectname1);
        document.getElementById('projectname1').value = projectname1;

        var col2 = currentRow.find("td:eq(1) input").val();
        var createdate1 = col2;
        document.getElementById('createdate1').value = createdate1;

        // var col3 = currentRow.find("td:eq(2) input").val();
        // var TeamMember1 = col3;
        // alert(TeamMember1);
        // document.getElementById('TeamMember1').value = TeamMember1;


        // var col3 = currentRow.find("td:eq(4) input").val();
        // var technology = col1;
        //  alert(technology);
        // document.getElementById('description1').value = description1;

        var col5 = currentRow.find("td:eq(5) input").val();
        var description1 = col5;
         // alert(description1);
        document.getElementById('description1').value = description1;
          
        var col6 = currentRow.find("td:eq(7) input").val();
        var status1 = col6;
        // alert(status1);
        document.getElementById('status1').value = status1;

          
        var col7 = currentRow.find("td:eq(8) input").val();
        var projectid1 = col7;
        document.getElementById('projectid1').value = projectid1;
    });
});

$(document).ready(function() {
    $(".save_data").on('click', function() {
        var projectname = document.getElementById('projectname1').value;
        alert(projectname);
        // var TeamMember = document.getElementById('TeamMember1').value;
          var description = document.getElementById('description1').value;
        var createdate = document.getElementById('createdate1').value;
      
        // var clientname = document.getElementById('clientname1').value;
        var Status  = document.getElementById('status1').value;
        var projectid = document.getElementById('projectid1').value;
        save(projectname,  createdate, description,  Status, projectid);

    });
});

function save(projectname, createdate, description,  Status, projectid)  {
    console.log(projectname);
    console.log(createdate);
    console.log(description);
    // console.log(clientname);
    console.log(projectid);
    // console.log(data6);
    $.ajax({
        url: 'http://localhost:3000/projectlist',

        data: { Status: Status, projectname: projectname, createdate: createdate, description: description,  projectid: projectid },
        method: 'post',
        dataType: 'html',
        success: function(data) {
            console.log(data);
            document.location.href = '/projectlists';
            // $('#IDS').html(data);
        }
    });
}

$(document).ready(function() {
    $('#link').on('click', function() {
        minireport();
    });
});

function minireport() {
    console.log("err");
    $.ajax({
        url: 'http://localhost:3000/Aprojects',
        type: 'get',
        dataType: 'html',
        success: function(result) {
            document.location.href = '/Aprojects';
        }
    });

}




$(document).ready(function() {
      // $("#imagen").show();
//  Submit Form
$('form').submit(function(event) {
    console.log(event);


var formData = {
    'username': $('select[name=username]').val(),
    'projectname': $('select[name=projectname]').val(),
    'task_insert': $('input[name=task_insert]').val(),


};
 

 console.log(formData);

  
$.ajax({
    type: 'POST',
    url: 'http://localhost:3000/task',
      data: formData,
    dataType: 'json',
    encode: true,
    success: function(response) {
        console.log("Response", response);
        // document.location.href = '/Aprojectsdetails';
    window.location = 'http://localhost:3000/Aprojectsdetails';
    },
    error: function(err) {
        console.log(err);

        // alert('Error');

    }
})
viewlist(formData);
event.preventDefault();
});
});


   
    //  main button click function
   function viewlist(formData){
        // $('.submit_button').on('click', function(formData){
        // remove nothing message
        if ('.nothing-message') {
            $('.nothing-message').hide('slide',{direction:'left'},300)
        };

        // create the new li from the form input
        // var task = $('input[name=task_insert]').val();
        console.log(formData);
        var newTask = '<li>' + '<p>'+ 'Developer_Name:' +formData.username+ '</br>' + 'Project_Name:'+formData.projectname+'</br>'+'Task:'+formData.task_insert+'</p>' + '</li>'
        $('#task-list').append(newTask);

        // clear form when button is pressed
         $('input').val('');

        // Alert if the form in submitted empty
        // if (formData.length == 0) {
        //     alert('please enter a task');
        // };

        // makes other controls fade in when first task is created
        $('#controls').fadeIn();
        $('.task-headline').fadeIn();
    }

    // mark as complete
    // $(document).on('click','li',function(){
    //     $(this).toggleClass('complete');
    // });
    
    // double click to remove
    // $(document).on('dblclick','li',function(){
    //     $(this).remove();
    // });

    // Clear all tasks button
    $('button#clear-all-tasks').on('click', function(){
        $('#task-list li').remove();
        $('.task-headline').fadeOut();
        $('#controls').fadeOut();
        $('.nothing-message').show('fast');
    });

// 