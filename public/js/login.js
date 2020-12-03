function DeclineClicked() {
  $(".cookies-consent_bar").hide();
  $("#cookies").prop("checked", false);
}
function AcceptClicked() {
  cookiesAccepted = true;
  $(".cookies-consent_bar").hide();
  $("#cookies").prop("checked", true);
}
