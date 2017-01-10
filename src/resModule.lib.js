var Tooltip = function (_text, _linked) {
    var text = _text;
    var linked = _linked;
    var element;
    var that =
    {
        move: function (kmouse) {
            var y = kmouse.pageY - element.height() - 20;
            y = (y < 0) ? 0 : y;
            var x = kmouse.pageX + 15;
            var eWidth = element.width();
            x = (x + eWidth > $(document).width()) ? $(document).width() - eWidth : x;
            element.css({left: x, top: y});
        },
        show: function () {
            element = $("<div class='tooltip'><p>" + text + "</p></div>");
            $("body").append(element);
            element.css({opacity: 0.8, display: "none"}).fadeIn(400);
            if (linked) {
                $(linked).mousemove(that.move);
                $(linked).mouseout(that.hide);
            }
        },
        hide: function () {
            //alert("Hide: "+$(linked).attr("class")+$(linked).get(0).tagName);
            element.detach();
            if (linked) {
                $(linked).unbind("mousemove", that.move);
                $(linked).unbind("mouseout", that.hide);
            }
            element = null;
            //element.fadeOut(400);
        }
    };
    that.show();
    return that;
};
/*
 1 - Вводные слова (знаем, что)
 2 - Иначе (иначе следует)
 3 - Известно, что (один факт)
 4 - делаем вывод, что
 */
var WordRandomizer = function () {
    var lastWords = [];
    var words =
        [
            [],
            ['Знаем, что', 'Известно, что', 'Есть информация, что'],
            ['Иначе следует, что', 'В противном случае следует, что', 'Если это не так, то'],
            ['Известно, что', 'Знаем, что', 'Факты говорят о том, что'],
            ['Можно сделать вывод, что', 'Очевидно, что', 'Следовательно,', 'Можем сказать, что', 'Делаем вывод, что', 'Заключаем, что', 'Приходим к выводу, что'],
            ['В то же время известно, что если', 'Также мы знаем, что если', 'Также нам известно, что если', 'Если же']
        ];
    var that =
    {
        getWord: function (situation) {
            var random = Math.round(Math.random() * (words[situation].length - 1));
            return words[situation][random];
        }
    };
    return that;
};
/*
 Defines Logic task
 Accepts object _params with keys: picture,variables,story,expressions,proofs
 */
var LogicTask = function (_params) {
    var params = {};
    var tooltip;
    var selectedPicture = false;//For creating pares img-expression
    var isOverPicture = false;
    var defaultValues = {
        picture: "picture",
        variables: "variables",
        story: "story",
        expressions: "expressions",
        proofs: "proofs",
        solve: "solve"
    };
    var elOver = function () {
        $(this).data("linked").addClass("over");
        $(this).addClass("over");
        var linkedPicture = $(this).data("linkedPicture");
        if (linkedPicture) {
            linkedPicture.addClass("selected");
        }
        var parent = $(this).parent().attr("id");
        var tooltipText = false;
        if (parent == params.story) {
            var tooltipText = "Это словесное описание для выражения, которое сейчас подсвечивается в ";
            if ($(this).data("linked").parent().attr("id") == params.expressions) {
                tooltipText += "окне выражений."
            }
            else tooltipText += "окне доказательств.";
            tooltipText += " Наведите мышь на это выражение для выполнения действий.";
            tooltip = Tooltip(tooltipText, this);
        }
        if (!selectedPicture) {
            if (parent == params.expressions) tooltipText = "Кликните, чтобы переместить это выражение в окно доказательств.";
            if (parent == params.proofs) {
                if ($(this).data("linkedPicture")) {
                    tooltipText = "Кликните, чтобы отменить инверсию выражения и переместить его в окно выражений. Обратите внимание, что связь с уликой на изображении будет нарушена.";
                }
                else {
                    tooltipText = "Кликните, чтобы вернуть выражение в окно выражений.";
                }
            }
        }
        else {
            if (parent == params.expressions) tooltipText = "Кликните, чтобы опровергнуть это выражение с помощью выбранной улики.";
            else if (parent == params.proofs) {
                tooltipText = "Кликните, чтобы опровергнуть это выражение с помощью выбранной улики. Внимание! Старая связь этого выражения с уликой будет отменена и оно будет возвращено в окно выражений.";
            }
        }
        if (tooltipText) Tooltip(tooltipText, this);
    };
    var elOut = function () {
        $(this).data("linked").removeClass("over");
        $(this).removeClass("over");
        var linkedPicture = $(this).data("linkedPicture");
        if (linkedPicture) {
            linkedPicture.removeClass("selected");
        }
    };
    var expClick = function () {
        var parent = $(this).parent().attr("id");
        if (selectedPicture) {
            if ($(selectedPicture).data("linkedExpression")) {
                //Move to expressions old expression (with invertion)
                var expression = $(selectedPicture).data("linkedExpression");
                expression.detach();
                expression.data("expression", LogicNOT(expression.data("expression")));
                expression.text(expression.data("expression").getMath());
                $("#" + params.expressions).append(expression);
                expression.trigger('mouseout');
                expression.data("linkedPicture", false);
            }
            var moveObject;//Object, that we will move to the proof window
            if (parent == params.story) {
                moveObject = $(this).data("linked");
            }
            else moveObject = $(this);

            if (moveObject.parent().attr('id') == params.proofs) {
                if (moveObject.data("linkedPicture")) {
                    moveObject.data("linkedPicture").data("linkedExpression", false);
                    moveObject.data("linkedPicture").removeClass("used");
                    moveObject.data("linkedPicture").removeClass("selected");
                }
                else {
                    moveObject.data("expression", LogicNOT(moveObject.data("expression")));
                    moveObject.text(moveObject.data("expression").getMath());
                }
            }
            else {
                moveObject.detach();
                $("#" + params.proofs).append(moveObject);
                moveObject.trigger('mouseout');
                moveObject.data("expression", LogicNOT(moveObject.data("expression")));
                moveObject.text(moveObject.data("expression").getMath());
            }
            //Move from expressions to proofs with invertion

            moveObject.data("linkedPicture", $(selectedPicture));
            $(selectedPicture).data("linkedExpression", moveObject);
            $(selectedPicture).addClass("used");
            selectedPicture = false;
        }
        else {
            if (parent == params.expressions) {
                var moveObject = $(this);
                moveObject.detach();
                $("#" + params.proofs).append(moveObject);
                moveObject.trigger('mouseout');
            }
            else if (parent == params.proofs) {
                var moveObject = $(this);
                moveObject.detach();
                $("#" + params.expressions).append(moveObject);
                moveObject.trigger('mouseout');
                if (moveObject.data("linkedPicture")) {
                    //Inversion
                    moveObject.data("expression", LogicNOT(moveObject.data("expression")));
                    moveObject.text(moveObject.data("expression").getMath());
                    moveObject.data("linkedPicture").data("linkedExpression", false);
                    moveObject.data("linkedPicture").removeClass("used");
                    moveObject.data("linkedPicture").removeClass("selected");
                    moveObject.data("linkedPicture", false);
                }
            }
        }
    };
    var newCheck = function (jOffset, max) {
        var answer = false;
        //alert("newCheck. Offset:"+jOffset+", max: "+max+", length:"+chains.length);
        for (var i = 0; i < max && !answer; i++) {
            for (var j = (i < jOffset ? jOffset : i); j < max && !answer; j++) {
                if (i != j) {
                    var newChain = chains[i].makeResolution(chains[j]);
                    if (newChain) {
                        var add = true;
                        var newLength = newChain.getLength();

                        for (var key in chains) {
                            if (chains[key].isEqual(newChain) && chains[key].getLength() <= newLength) {
                                add = false;
                            }
                        }
                        if (add) {
                            chains.push(newChain);
                            if (newChain.success) answer = newChain;

                            //document.write("New chain:"+newChain.getExpression().getMath()+"("+newLength+") is from "+chains[i].getExpression().getMath()+" and "+chains[j].getExpression().getMath()+"<br/>");
                        }
                    }
                }
            }
        }

        if (!answer && max < 100) {
            newCheck(max, chains.length);
        }
        else if (answer) return answer;
        else return false;
    };
    var picOver = function (manual) {
        isOverPicture = true;
        //if(tooltip) tooltip.hide();
        $(this).addClass("selected");
        var tooltipText;
        if (selectedPicture == this || (typeof manual == "boolean" && manual)) {
            tooltipText = "Вы выбрали эту улику. Теперь нужно определить, какое выражение она опровергает или кликнуть повторно для отмены действия.";
        }
        else {
            if ($(this).data("linkedExpression")) {
                tooltipText = "Кликните, чтобы выбрать новое выражение, которое опровергает эта улика. Внимание! Старое выражение будет возвращено в окно выражений.";
            }
            else {
                tooltipText = "Кликните, чтобы выбрать выражение, которое опровергает эта улика.";
            }
        }
        tooltip = Tooltip(tooltipText, this);
        if ($(this).data("linkedExpression")) {
            $(this).data("linkedExpression").addClass("over");
            $(this).data("linkedExpression").data("linked").addClass("over");
        }
    };
    var picOut = function () {
        isOverPicture = false;
        if (selectedPicture != this) $(this).removeClass("selected");
        if ($(this).data("linkedExpression")) {
            $(this).data("linkedExpression").removeClass("over");
            $(this).data("linkedExpression").data("linked").removeClass("over");
        }
    };
    var resizeExpPictures = function () {
        var mainPicture = $("#" + params.story + " .mainPicture");
        var xc = mainPicture.width() / mainPicture.attr("data-width");
        var yc = mainPicture.height() / mainPicture.attr("data-height");
        console.log(yc);
        $("#" + params.story).children("div").each(function (index, element) {
                element = $(element);
                if (element.hasClass("expPicture")) {
                    element.css("left", element.attr("data-x") * xc)
                        .css("top", element.attr("data-y") * yc)
                        .css("width", element.attr("data-width") * xc)
                        .css("height", element.attr("data-height") * yc);
                }
            }
        );
    };
    var picSelect = function () {
        tooltip.hide();
        //if(selectedPicture) $(selectedPicture).removeClass("selected");
        if (selectedPicture != this) {
            $(selectedPicture).removeClass("selected");
            selectedPicture = this;
            picOver(true);
        }
        else {
            selectedPicture = false;
            picOver(false);
        }
    };
    var variables = [];
    //Get module parametres
    for (var key in defaultValues) {
        params[key] = _params[key] ? _params[key] : defaultValues[key];
    }
    //Process variable window
    $("#" + params.variables).children().each(function (index, element) {
        var el = $(element);
        var newVar = LogicVariable(el.attr("data-name"), el.text(), el.attr("data-inversion"));
        if (el.attr("data-final") == "true") {
            newVar.isFinal = true;
            //alert(el.attr("data-name")+" is final");
        }
        variables[el.attr("data-name")] = newVar;
        //document.write(el.text()+":"+newVar.getMath()+"<br>");
        var container = $("<div></div>");
        el.before(container);

        el.detach();

        container.append("<h6>" + el.attr("data-name") + "</h6>");
        container.append(el);
        el.trigger('mouseout');
    });
    //Process expression window
    var expBlock = $("#" + params.expressions);
    $("#" + params.story).children("span").each(function (index, element) {
        var el = $(element);
        var expDOM = $("<div></div>");
        var expText = el.attr("data-expression").replace(/%(\w+)%/g, "variables['$1']");
        var expression;
        //alert(expText);
        expression = eval(expText);
        //document.write(variables['S']);
        //expression=LogicImplication(LogicAND(variables['S'],LogicNOT(variables['BN'])),variables['PA']);
        expDOM.text(expression.getMath());
        expDOM.data("expression", expression);
        expBlock.append(expDOM);
        el.data("linked", expDOM);
        expDOM.data("linked", el);
        expDOM.mouseover(elOver);
        expDOM.mouseout(elOut);
        expDOM.click(expClick);
        el.mouseover(elOver);
        el.mouseout(elOut);
        el.click(expClick);
    });
    $(window).load(resizeExpPictures);
    $(window).resize(resizeExpPictures);
    //
    var expPictures = $("#" + params.picture).children(".expPicture");
    expPictures.each(function (index, element) {
        $(element).mouseover(picOver);
        $(element).mouseout(picOut);
        $(element).click(picSelect);
    });
    var pictureBlockOver = function () {
        if (!selectedPicture && !isOverPicture) tooltip = Tooltip("Найдите улики на картинке и укажите, какие высказывания они опровергают.", this);
    };
    $("#" + params.picture).children(".mainPicture").mouseover(pictureBlockOver);
    var getRandomPhrase = function (type) {
        if (type == 1) return "Итак, приступим к расследованию.";
        if (type == 2) return "Вы собрали важную информацию для расследования, повторим её:";
        if (type == 3) return "Теперь можем преобразовать эти высказывания (получим КНФ):";
        if (type == 4) return "Слишком грамоздко, не правда ли? Используя метод резолюций будем укорачивать эти высказывания:";
    };
    var solveNow = function () {
        var statements = [];
        var solveWindow = $("#" + params.solve);
        solveWindow.text("");
        $("#" + params.proofs).children("div").each(function (index, element) {
            statements.push($(element).data("expression"));
        });
        solveWindow.append("<p>" + getRandomPhrase(1) + "</p>");
        var statementsBlock = $("<p>" + getRandomPhrase(2) + "</p>");
        if (statements.length > 0) {
            var statementsList = $("<ul></ul>");
            for (var key = 0; key < statements.length; key++) {
                statementsList.append("<li class='hasLegend'>" + statements[key].getText() + "<span class='legend'>" + statements[key].getMath() + "</span></li>");
            }
            statementsBlock.append(statementsList);
            solveWindow.append(statementsBlock);
            var CNFBlock = $("<p>" + getRandomPhrase(3) + "</p>");

            var CNF = [];
            for (var key = 0; key < statements.length; key++) {
                //statements.splice(key,0);
                var simpleBasisStatement = statements[key].getSimpleBasis();
                var statementBlock = $("<div style='border-bottom: 1px solid grey;'></div>");
                statementBlock.append("<p class='hasLegend'>Рассмотрим высказывание: " + statements[key].getText() + "<span class='legend'>" + statements[key].getMath() + "</span></p>");
                if (!simpleBasisStatement.compare(statements[key])) {
                    statementBlock.append("<p class='hasLegend'>Избавимся от импликации и эквивалентности, получим:" + simpleBasisStatement.getText() + "<span class='legend'>" + statements[key].getMath() + " = " + simpleBasisStatement.getMath() + "</span></p>");
                }
                var innerNotStatement = simpleBasisStatement.getWithoutComplexInversion();
                if (!innerNotStatement.compare(simpleBasisStatement)) {
                    statementBlock.append("<p class='hasLegend'>Внесем все отрицания внутрь скобок, пользуясь законами де Моргана: " + innerNotStatement.getText() + "<span class='legend'>" + simpleBasisStatement.getMath() + " = " + innerNotStatement.getMath() + "</span></p>");
                }
                var mergedStatement = innerNotStatement.getMerged();
                if (!mergedStatement.compare(innerNotStatement)) {
                    statementBlock.append("<p class='hasLegend'>Воспользуемся формулами поглощения: " + mergedStatement.getText() + "<span class='legend'>" + innerNotStatement.getMath() + " = " + mergedStatement.getMath() + "</span></p>");
                }
                var CNFStatement = mergedStatement.getWithoutInnerAND();
                if (!CNFStatement.compare(mergedStatement)) {
                    statementBlock.append("<p class='hasLegend'>По свойству дистрибутивности получим: " + CNFStatement.getText() + "<span class='legend'>" + mergedStatement.getMath() + " = " + CNFStatement.getMath() + "</span></p>");
                }
                var statementConjuncts = CNFStatement.getConjuncts();

                //if(statementConjuncts.length>1)
                //{
                var groupId = 1;
                statementBlock.append("<p class='hasLegend'>Разобьем высказывания на группы:<span class='legend'>В каждой из таких групп истино <b>хотя бы одно</b> высказывание.</span></p>");
                var CNFList = $("<ul></ul>");
                for (var innerKey in statementConjuncts) {
                    CNF.push(statementConjuncts[innerKey]);
                    var statementDisjuncts = statementConjuncts[innerKey].getDisjuncts();
                    var disjunctsList = $("<ul></ul>");
                    //CNFList.append("<li class='hasLegend'>"+statementConjuncts[innerKey].getText()+"<span class='legend'>"+statementConjuncts[innerKey].getMath()+"</span></li>");
                    for (var disjunctKey in statementDisjuncts) {
                        disjunctsList.append("<li class='hasLegend'>" + statementDisjuncts[disjunctKey].getText() + "<span class='legend'>" + statementDisjuncts[disjunctKey].getMath() + "</span></li>");
                    }
                    var CNFItem = $("<li><span class='hasLegend'>Группа " + groupId + "<span class='legend'>Образована из высказывания: " + statementConjuncts[innerKey].getText() + "</span></li>");
                    CNFItem.append(disjunctsList);
                    CNFList.append(CNFItem);
                    groupId++;
                }
                statementBlock.append(CNFList);
                //}
                CNFBlock.append(statementBlock);
            }
            solveWindow.append(CNFBlock);
            //Создаём цепи на основе КНФ - каждая КНФ - новая цепь
            var chains = [];
            for (var key in CNF) {
                chains.push(LogicChain(CNF[key], []));
            }
            var flag = false;
            var answer = false;
            var max = chains.length;
            var jOffset = 0;
            //Ищем резольвенты для всех цепочек (у нас могут появится и новые цепочки)
            while (!answer && max < 300 && max != jOffset) {
                //document.write("newCheck. Offset:"+jOffset+", max: "+max+", length:"+chains.length);
                for (var i = 0; i < max && !answer; i++) {
                    for (var j = (i < jOffset ? jOffset : i); j < max && !answer; j++) {
                        if (i != j) {
                            var newChain = chains[i].makeResolution(chains[j]);
                            if (newChain) {
                                var add = true;
                                var newLength = newChain.getLength();
                                for (var key in chains) {
                                    if (chains[key].isEqual(newChain) && chains[key].getLength() <= newLength) {
                                        add = false;
                                    }
                                }
                                //Эксперимент: не принимаем цепочки с однотипными переменными
                                var checkOneType = function (newChain) {
                                    return true;
                                    var exp = newChain.getExpression();
                                    var expDisj = exp.getDisjuncts();
                                    var anotherFound = false;
                                    var originalFound = false;
                                    var inversionFound = false;
                                    for (var key in expDisj) {
                                        var string = expDisj[key].getMath();
                                        if (string == "LB" || string == "LC" || string == "LD") {
                                            originalFound = true;
                                        }
                                        else if (string == "!LB" || string == "!LC" || string == "!LD") {
                                            inversionFound = true;
                                        }
                                        else anotherFound = true;
                                    }
                                    if ((originalFound && inversionFound) && !anotherFound) {

                                        console.log("Забраковали " + exp.getMath());
                                        return false;
                                    }
                                    return true;
                                };
                                if (!(checkOneType(newChain) && checkOneType(chains[i]) && checkOneType(chains[j]))) {
                                    add = false;
                                }
                                //Конец эксперимента
                                if (add) {
                                    chains.push(newChain);
                                    if (newChain.success) answer = newChain;

                                    //document.write("New chain:"+newChain.getExpression().getMath()+"("+newLength+") is from "+chains[i].getExpression().getMath()+" and "+chains[j].getExpression().getMath()+"<br/>");
                                }
                            }
                        }
                    }
                }

                //if(!answer && max<100) {newCheck(max,chains.length);}
                jOffset = max;
                max = chains.length;
            }
            //answer=newCheck(0,chains.length);
            if (answer) {
                var output = describe(answer, CNF);
                for (var key in output) {
                    solveWindow.append(output[key]);
                }
                solveWindow.find(".hasLegend").mouseover(function () {
                    var text = $(this).children(".legend").first().html();
                    Tooltip(text, this);
                });


                /*each(function(index, element){
                 statements.push($(element).data("expression"));
                 });*/
            }
            else solveWindow.append("Не удалось найти преступника за разумное время.");
        }
        else solveWindow.append("<p>Вы не выбрали ни одного высказывания. Я не умею так расследовать.</p>");
    };
    /*
     Преобразовывает массив дизъюнктов в импликацию. Возвращает специальный объект с несколькими полями.
     */
    var _createImplication = function (disjuncts, reason) {
        var resultImplication;//Результирующая импликация
        var newDisjuncts = [];//Массив дизъюнктов без reason
        var matchedDisjunct;//Дизъюнкт-отрицание или сама reason
        var resultDisjunction = false;//Дизъюнкция в правой части импликации
        var flag = false;
        if (disjuncts.length <= 1) {
            //Из одного дизъюнкта или вообще без него импликацию не сделать
            return false;
        }
        else {
            for (var key in disjuncts) {
                console.log("Сравниваем:");
                console.log(disjuncts[key].getMath());
                console.log(reason.getMath());
                console.log("Отрицание reason: ");
                console.log(LogicNOT(reason).getMath());
                //console.log(disjuncts[key].compare(LogicNOT(reason)));
                console.log("Конец. Теперь результаты сравнения:");
                console.log(disjuncts[key].compare(reason));
                console.log(disjuncts[key].compare(LogicNOT(reason)));
                if (disjuncts[key].compare(reason) || disjuncts[key].compare(LogicNOT(reason))) {
                    //Если текущий дизъюнкт - отрицание или собственно reason
                    flag = true;
                    matchedDisjunct = LogicNOT(disjuncts[key]);
                }
                else {
                    resultDisjunction = resultDisjunction ? LogicOR(resultDisjunction, disjuncts[key]) : disjuncts[key];
                    newDisjuncts.push(disjuncts[key]);
                }
                console.log("Конец сравнения.");
            }
            if (flag) {
                //console.log("Implication found: "+
                return {
                    leftPart: matchedDisjunct,
                    rightPart: resultDisjunction,
                    implication: LogicImplication(matchedDisjunct, resultDisjunction),
                    disjuncts: newDisjuncts
                };
            }
            else return false;
        }

    };
    var describe = function (answer, CNF) {
        var text = "";
        var changes = ExpressionsContainer();
        var output = [];//Массив выводимых объектов
        var chain = answer.getChain();//Цепочка, с которой идёт работа
        var word = WordRandomizer();//Объект, генерирующий различные фразы
        console.log("Chain length: " + chain.length);
        for (var elId = chain.length - 1; elId >= 0; elId--) {
            var el = chain[elId];
            text = word.getWord(1) + " ";
            var resResult = el.op1.makeResolutionAdvanced(el.op2);
            var reason = resResult.reason; //Переменная, по которой была построена резольвента
            var dis1 = el.op1.getDisjuncts();
            var dis2 = el.op2.getDisjuncts();
            var ifPart;//Выражение, которое будет превращено в ЕСЛИ x, то
            var otherwisePart;//Выражение, которое будет превращено в ИНАЧЕ

            var legend = "Мы получили эту строку, найдя резольвенту для следующих выражений " + el.op1.getMath() + " и " + el.op2.getMath() + ", использовав дизъюнкт: " + reason.getMath() + " . Получилось: " + resResult.result.getMath();

            //Пытаемся превратить выражения в импликации
            var implication1 = _createImplication(dis1, reason);
            var implication2 = _createImplication(dis2, reason);
            console.log("Импликации собраны");
            //Добавляем полученные импликации в контейнер измненений, чтобы дальнейшие аналогичные дизъюнкции превращались в подобные импликации
            if (implication1) changes.push(el.op1, implication1.implication);
            if (implication2) changes.push(el.op2, implication2.implication);
            if (implication1 && implication2) {
                //Если обе импликации получились, то логично выбрать в качестве выражения ЕСЛИ ... то, где нет отрицания, для этого достаточно провести одну проверку
                if (implication1.leftPart.compare(reason)) {
                    ifPart = implication1;
                    otherwisePart = implication2;
                }
                else {
                    ifPart = implication2;
                    otherwisePart = implication1;
                }
            }
            else {
                //Иначе выбираем в качестве выражения ЕСЛИ ... единственную получившуюся импликацию. Достаточно одной проверки.
                ifPart = implication1 ? implication1 : implication2;
                otherwisePart = false;
            }
            text += "если " + ifPart.leftPart.getText() + ", то";
            //Собираем из массива дизъюнктов дизъюнкцию и выводим её на экран
            var orNeed = false;
            for (var key in ifPart.disjuncts) {
                if (orNeed) text += " или";
                text += " " + ifPart.disjuncts[key].getText();
                orNeed = true;
            }
            if (otherwisePart) {
                //Если существует часть ИНАЧЕ
                orNeed = false;
                //text+=". "+word.getWord(2); //Просто иначе - спорный вопрос
                text += ". " + word.getWord(5) + " " + otherwisePart.leftPart.getText() + ", то";
                for (var key in otherwisePart.disjuncts) {
                    if (orNeed) text += " или";
                    text += " " + otherwisePart.disjuncts[key].getText();
                    orNeed = true;
                }
            }
            else {
                //Значит здесь переменная, по которой найдена резольвента
                text += ". " + word.getWord(3) + " " + ifPart.leftPart.getText();
            }
            text += ". " + word.getWord(4) + " ";
            var resolution = resResult.result;
            var change = changes.find(resolution);
            var ansDis;
            if (change) {
                //Если такую дизъюнкцию надо перефразировать
                legend += "<=> " + change.getMath();
                text += "если " + change.getOperand(1).getText() + ", то";
                ansDis = change.getOperand(2).getDisjuncts();
            }
            else {
                ansDis = resolution.getDisjuncts();
            }
            orNeed = false;
            for (var key in ansDis) {
                var dis = ansDis[key];
                if (orNeed) text += " или";
                else orNeed = true;
                text += " " + dis.getText();
            }
            text += ".<span class='legend'>" + legend + "</span>";
            var outputElement = $("<div class='hasLegend'>" + text + "</div>");
            output.unshift(outputElement);
        }
        var answerHeaderBlock = $("<div>Теперь распишем, как всё было:</div>");
        output.unshift(answerHeaderBlock);
        var CNFBlock = $("<ul></ul>");
        for (var key in CNF) {
            var current = CNF[key];
            var currDis = current.getDisjuncts();
            var idString = "";
            var text = "";
            var legend = "";
            var change = changes.find(current);
            if (change) {
                legend = "Мы получили эту строку, пользуясь правилом A | B <=> !A=>B из конъюнкта КНФ, полученной ранее. " + current.getMath() + " <=> " + change.getMath() + " .";
                text = "Если " + change.getOperand(1).getText() + ", то";
                var ansDis = change.getOperand(2).getDisjuncts();
                orNeed = false;
                for (var key in ansDis) {
                    dis = ansDis[key];
                    if (orNeed) text += " или";
                    else orNeed = true;
                    text += " " + dis.getText();
                }
                CNFBlock.append("<li class='hasLegend'>" + text + "<span class='legend'>" + legend + "</span></li>");
            }
        }
        var CNFBlockContainer = $("<div>Выберем нужные нам выражения и преобразуем их: </div>");
        CNFBlockContainer.append(CNFBlock);
        output.unshift(CNFBlockContainer);
        console.log("Otput length: " + output.length);
        /*var text="";
         for(var key in output)
         {
         text+=output[key];
         }*/
        return output;
    };
    var that =
    {
        solve: solveNow
    };
    return that;
};