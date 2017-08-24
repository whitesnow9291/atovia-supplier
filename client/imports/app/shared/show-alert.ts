declare var Bert:any;

export const showAlert = function(message="No text supplied.", type="info", pos="growl-bottom-right") {
    Bert.alert( message, type, pos );
}