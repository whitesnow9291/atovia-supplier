// JavaScript Document
$(document).ready(function() {
	// setWindowHeight();
});
$( window ).resize( function () {
	// setWindowHeight();
});

function setWindowHeight(){
	var windowHeight = $(window).height();
	$('.table-wrapper').height(windowHeight);
	var tableHeight = $('.table-wrapper').height();
}

$("#input-icon .form-control").focus( function(){
		$("#input-icon .form-control + span i").css("color", "#16a085");
	});
