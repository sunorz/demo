var language = "";
var price = 0;
var bookname = "";
var books = new Array();
function getJsonData() {
  $.ajaxSettings.async = false;
  $.getJSON("js/50/lists.json", function (data, status) {
    if (status == "success") {
      language = data.lang.toString();
      books = Array.from(data.books);
      $.ajaxSettings.async = true;
    } else {
      return false;
    }
  });
}
getJsonData();
if (language == "en") {
  language = "英文";
}
bookname = books[1].title.toString();
price = parseFloat(books[1].price);
document.write(
  "《" + bookname + "》的语言为" + language + ",售价为¥" + price * 0.8
);
