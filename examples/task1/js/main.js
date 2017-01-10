(function () {
    var welcome, overlay, solveBlock, solveWindow, task;

    function hideWelcome() {
        welcome.detach();
        overlay.fadeOut(400);
    }

    function solve() {
        $("body").append(solveWindow);
        solveBlock.append("<p>Идёт расследование...</p>");
        overlay.fadeIn(400);
        setTimeout(task.solve, 1000);
    }

    function closeSolution() {
        overlay.fadeOut(400);
        solveBlock.text("");
        solveWindow.detach();
    }

    function init() {
        welcome = $("#welcome");
        solveWindow = $("#solveWindow");
        solveBlock = $("#solve");
        overlay = $("#overlay");
        solveWindow.detach();
        overlay.append(welcome);
        solveWindow.children(".closeButton").click(closeSolution);
        welcome.children(".continueButton").click(hideWelcome);
        $(".solveButton").click(solve);
        task = new LogicTask({story: "picture"});
    }



    $(document).ready(init);
})();
