$(document).ready(function () {
    // Clickables
    $("button[status=hidden]").on("click", commentButtonStatus);
    $("button.save").on("click", saveArticle);
    $("button#new-comment").on("click", showText)
    $("button#submit-comment").on("click", submitComment);
    $("body").on("click", "button.delete-comment", deleteComment);
    $("#scrape").on("click", scrapeArticles);
    // Functions
    function commentButtonStatus() {
        const thisStatus = $(this).attr("status");

        if (thisStatus === "hidden") {
            $(this).siblings('.comments').slideDown("fast");
            $(this).attr("status", "shown").removeClass("btn-info").addClass("btn-danger").text("Hide Comments");
        } else if (thisStatus === "shown") {
            $(this).siblings('.comments').slideUp("fast");
            $(this).attr("status", "hidden").removeClass("btn-danger").addClass("btn-info").text("Show Comments");
        }
    };

    function saveArticle() {
        const thisSaveStatus = !($(this).attr("save-status") == "true");
        const articleId = $(this).parent().parent().attr("data-id");

        $.post(`/save-article/${articleId}`, { isSaved: thisSaveStatus })
            .then((ret) => {
                console.log(ret);
                $(this).attr("save-status", ret);
                if (ret) {
                    $(this).removeClass("btn-primary").addClass("btn-danger").text("Un-Save");
                } else {
                    $(this).removeClass("btn-danger").addClass("btn-primary").text("Save");
                }
            });

    };

    function showText() {
        const currentDisplay = $(this).siblings("div.textbox").css("display");

        if (currentDisplay === "none") {
            $(this).siblings("div.textbox").css({ display: "block" });
        } else if (currentDisplay === "block") {
            $(this).siblings("div.textbox").css({ display: "none" });
        }
    }

    function submitComment() {
        const text = $(this).siblings("textarea").val().trim();
        const articleId = $(this).parent().parent().attr("data-id");
        const comments = $(this).parent().siblings(".comments");

        $.post(`/comment/${articleId}`, { text: text })
            .then((ret) => {
                // console.log(ret);
                $(this).parent().siblings(".comments").children("h5").remove();
                const newDiv = $("<div>").attr("class", "row mt-2 border rounded");
                const newText = $("<p>").text(ret.text).attr("data-id", ret._id)
                    .attr("class", "col-11 mb-0");
                const newDeleteButton = $("<button>").attr("class", "btn btn-sm btn-danger col-1 delete-comment")
                    .text("X");

                newDiv.append(newText, newDeleteButton);
                comments.append(newDiv);
            });
    };

    function deleteComment() {
        const comment = $(this).siblings("p");
        console.log(comment);
        $.ajax({
            url: `/delete-comment/${comment.attr("data-id")}`,
            method: "DELETE"
        }).then(function (ret) {
            console.log(ret);
            comment.parent().remove();
        })
    };

    function scrapeArticles() {
        $.get("/scrape")
            .then(function(ret){
                location.reload();
            });
    };

});
