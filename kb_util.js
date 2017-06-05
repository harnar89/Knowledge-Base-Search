//Get the bot_id from url on page load.
var bot_id='';

//Load the knowledge base
$(function() {
    var current_path = window.location.pathname;
    if(current_path.includes('knowledge_base'))
    {
        bot_id = current_path.replace('/edit/','').replace('/knowledge_base','');
        get_knowledge_base();        
    }
});

//Button is hidden for now.
$('#submitKb').click(function() {
    var records_saved = false;
    $('#kb_list .kb_container').each(function() {
        if ($(this).find('#kb_id').val() == '') {
            var postData = {};
            postData['title'] = $(this).find('#kb_title').val();
            postData['description'] = $(this).find('#kb_description').val();
            postData['url'] =  $(this).find('#kb_url').val();
            postData['image_url'] =  $(this).find('#kb_image_url').val();
            data=JSON.stringify(postData);
            var url = "/bots/" + bot_id + "/kb_docs";
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, false);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = () => {
                if(xhr.readyState === 4) {
                    if(xhr.status === 200 || xhr.status === 201) {
                        records_saved = true;
                    } else {
                        alert('Could not save records.');
                    }
                }
            };
            xhr.send(data);
        }
        $(this).css('height','20px');
        $(this).find('.collapsible-heading').css('display','block');
        $(this).find('.collapsible-heading').find('span').html($(this).find('#kb_title').val() + " ");
        $(this).find('.content').css('display', 'none');
    });
});

//Exapnd the record on click of the title.
function expandContents(data) {
    parent=$(data).parent().parent();
    $(data).parent().css('display', 'none');
    $(parent).css('height','380px');
    $(parent).find('.content').css('display','block');
    $(parent).addClass('mui-panel');
    $(parent).css('margin-left', '1%');
    $(parent).css('padding-top', '0%');
}

//Collapse the record on click of '-'.
function collapseContents(data) {
    parent=$(data).parent().parent();
    var id = $(parent).find('#kb_id').val();
    $(parent).removeClass('mui-panel');
    $(parent).css('margin-left', '0%');
    $(parent).css('height','20px');
    $(parent).find('.collapsible-heading').css('display','block');
    $(parent).find('.content').css('display', 'none');
    if (id == '') {
        $(parent).parent().css('display', 'none');
    }
}

//Add new row on click of 'Add Title/Description'.
function addNewRow() {
    var template = '<li>' + $('.kb_record').html() + '</li>';
    var clone = $(template).clone();
    $(clone).find('.collapsible-heading').css('display','none');
    $(clone).find('.content').css('display','block');
    $(clone).find('.content').parent().css('height','380px');
    $(clone).find('.kb_container').addClass('mui-panel');
    $(clone).find('.kb_container').css('margin-left', '1%');
    $(clone).find('.kb_container').css('padding-top', '0%');
    $('#kb_list').append(clone);
}

//Save individual records.
function saveRecord(data) {
    parent=$(data).parent().parent();
    saveData = {};
    saveData['title'] = $(parent).find('#kb_title').val();
    saveData['description'] = $(parent).find('#kb_description').val();
    saveData['url'] = $(parent).find('#kb_url').val();
    saveData['image_url'] = $(parent).find('#kb_image_url').val();
    if (saveData['title'] == '' && saveData['description'] == '') {
        alert('Enter the Title and Description');
        return false;
    } else if (saveData['title'] == '') {
        alert('Enter the Title');
        return false;
    } else if (saveData['description'] == '') {
        alert('Enter the Description');
        return false;
    }
    var res = JSON.stringify(saveData);
    const xhr = new XMLHttpRequest();
    if($(parent).find('#kb_id').val() == '') {
        var signedRequest = "/bots/" + bot_id + "/kb_docs/";
        xhr.open('POST', signedRequest, false);
    } else {
        var signedRequest = "/bots/" + bot_id + "/kb_docs/" + $(parent).find('#kb_id').val();
        xhr.open('PUT', signedRequest, false);
    }
    
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if(xhr.status === 200 || xhr.status === 201) {
                    $.notify("Record saved successfully", {className: "success", position:"right bottom"});
                    if ($(parent).find('#kb_id').val() == '') {
                        addNewRow();
                }
            } else {
                $.notify("Could not save record", {className: "warning", position:"right bottom"});
            }
        }
    };
    xhr.send(res);
    $(parent).css('height','20px');
    $(parent).find('.collapsible-heading').find('span').html($(parent).find('#kb_title').val()  + " ");
    $(parent).find('.collapsible-heading').css('display','block');
    $(parent).find('.content').css('display', 'none');
    $(parent).removeClass('mui-panel');
    $(parent).css('margin-left', '0%');
}

//Getting the entire knowledge base. Called on load of body.
function get_knowledge_base() {
    var template = '<li>' + $('.kb_record').html() + '</li>';
    const xhr = new XMLHttpRequest();
    var url = "/bots/" + bot_id + "/kb_docs";
    xhr.open('GET', url);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                for (var item in response) {
                    var clone = $(template).clone();
                    $(clone).find('#kb_id').val(response[item].id);
                    $(clone).find('#kb_title').val(response[item].title);
                    $(clone).find('#kb_description').html(response[item].description);
                    $(clone).find('#kb_url').val(response[item].url);
                    $(clone).find('#kb_image_url').val(response[item].image_url);
                    $(clone).find('#saverow').attr('data-value', response[item].id);
                    $(clone).find('.collapsible-heading').attr('data-value', response[item].id);
                    $(clone).find('.collapsible-heading').find('span').html(response[item].title + " ");
                    $('#kb_list').append(clone);
                }
            } else {
                alert('Error while retrieving Knowledge Base');
            }
        }
    };
    xhr.send();
}

//Cancel Operation.
function cancelRecord(data) {
    parent = $(data).parent().parent();
    var id = $(parent).find('#kb_id').val();
    if(id == '')
    {
        $(parent).css('display', 'none');
        $(parent).parent().css('display', 'none');
    }
    else
    {
        $(parent).css('height', '20px');
        $(parent).find('.collapsible-heading').css('display', 'block');
        $(parent).find('.content').css('display', 'none');
    }
    $(parent).removeClass('mui-panel');
    $(parent).css('margin-left', '0%');
}

//Delete record - Waiting for the API to be merged to test further.
function deleteContents(data) {
    parent=$(data).parent().parent();
    trashData = {};
    trashData['title'] = $(parent).find('#kb_title').val();
    trashData['description'] = $(parent).find('#kb_description').val();
    trashData['url'] = $(parent).find('#kb_url').val();
    trashData['image_url'] = $(parent).find('#kb_image_url').val();
    var res = JSON.stringify(trashData);
    const xhr = new XMLHttpRequest();
    if ($(parent).find('#kb_id').val() != '') {
        var signedRequest = "/bots/" + bot_id + "/kb_docs/" + $(parent).find('#kb_id').val();
        xhr.open('DELETE', signedRequest, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if(xhr.status === 200 || xhr.status === 201) {
                    $.notify("Record deleted successfully", {className: "success", position: "right bottom"});
                } else {
                    $.notify("Could not delete record", {className: "warning", position:"right bottom"});
                }
            }
        };
        xhr.send(res);
    }
    $(parent).parent().css('display', 'none');
}