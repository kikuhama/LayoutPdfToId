// Version 1.0.1 (2014/2/11)
#target indesign

function SettingsDialog() {
    var left = 100;
    var top = 100;
    var width = 400;
    var height = 80;
    var labelWidth = 50;
    var editHeight = 20;
    var buttonHeight = 25;
    var buttonWidth = 100;
    var x = 10;
    var y = 10;
    var dialog = new Window("dialog", "設定");
    var settings = this;
    dialog.bounds = [left, top, left+width, top+height];
    this.pdfFolder = null;

    dialog.folderLabel = dialog.add("statictext",
				    [x, y, x+labelWidth, y+editHeight],
				    "フォルダ");
    x += (labelWidth+10);
    dialog.folderText = dialog.add("edittext",
				   [x, y, x+250, y+editHeight],
				   "");
    dialog.folderText.onChange = function() {
	settings.pdfFolder = new Folder(dialog.folderText.text);
    };
    x += (250+10);
    dialog.folderButton = dialog.add("button",
				     [x, y, x+labelWidth, y+editHeight],
				     "参照");
    dialog.folderButton.onClick = function() {
	var folderObj = Folder.selectDialog("フォルダを選択してください。");
	if(folderObj) {
	    dialog.folderText.text = folderObj.fsName;
	    settings.pdfFolder = folderObj;
	}
    };
    x = width - buttonWidth*2 - 10 - 10;
    y += (editHeight + 10);

    dialog.okBtn = dialog.add("button",
			      [x, y, x+buttonWidth, y+buttonHeight],
			      "OK",
			      {name: "ok"});
    x += (buttonWidth + 10);
    dialog.cancelBtn = dialog.add("button",
				  [x, y, x+buttonWidth, y+buttonHeight],
				  "Cancel",
				  {name: "cancel"});

    this.dialog = dialog;
}

SettingsDialog.prototype.show = function() {
    return this.dialog.show();
}

function processFolder(doc, folder) {
    var files = folder.getFiles("*.pdf");
    var pageNumber = 0;
    for(var i=0; i<files.length; ++i) {
	pageNumber = processFile(doc, pageNumber, files[i]);
    }
}

function processFile(doc, pageNumber, file) {
    app.pdfPlacePreferences.pageNumber = 1;
    app.pdfPlacePreferences.pdfCrop = PDFCrop.CROP_MEDIA;

    var eof = false;
    var isFirstPage = true;

    while(!eof) {
	while(doc.pages.length < (pageNumber+1)) {
	    doc.pages.add(LocationOptions.AT_END);
	}
	
	var page = doc.pages[pageNumber];
	var layer = doc.layers[0];
	var txtFrame = page.textFrames.add();
	txtFrame.visibleBounds = page.bounds;
	txtFrame.place(file);
	
	if(!isFirstPage && app.pdfPlacePreferences.pageNumber == 1) {
	    // ページが最後尾を越えた
	    eof = true;
	    doc.pages.lastItem().remove();
	}
	else {
	    isFirstPage = false;
	    pageNumber++;
	    app.pdfPlacePreferences.pageNumber++;
	}
    }
    return pageNumber;
}

if(app.documents.length > 0) {
    var dialog = new SettingsDialog();
    if(dialog.show() != 2) {
	processFolder(app.activeDocument, dialog.pdfFolder);
	alert("終了");
    }
    else {
	alert("キャンセルされました。");
    }
}
else {
    alert("ドキュメントが開かれていません。");
}

