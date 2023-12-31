
const vscode = require('vscode');
const { privateEncrypt } = require('crypto');
const {extractCodeBlockContent}=require('./gencode/extractcode')
const path = require('path');
const fs = require('fs');
const {api}=require('./gencode/apigpt')
//api chatgpt configuratonio


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	//1er commande generer un code
	let disposable = vscode.commands.registerCommand('code-gen.gencode', function () {
		const editor = vscode.window.activeTextEditor;
    	if (editor) { const document = editor.document;
		  const position = editor.selection.active;
		  console.log(`Cursor position: Line ${position.line + 1}, Column ${position.character + 1}`);
		  // la position de curseur
		  const endPosition = new vscode.Position(position.line + 2, 1);
		  //extraire extension de fichier
		  const filePath = document.fileName;//extraire le nom de fechier compléte
		  const extension = path.extname(filePath).slice(1);//extraire extansion
    	  try { const commentRegex = /\/\/(.*)|\/\*([\s\S]*?)\*\/|#(.*)/g;// regex pour extraire les commantaire dans les language javascript, python and java ...
  			const comments = [];
			//en charge dans la liste comments touts les commentaire existant
  			for (let i = 0; i < document.lineCount; i++) {
  			  const line = document.lineAt(i).text;
  			  let match;
  			  while ((match = commentRegex.exec(line))) {
  			    // Nous avons trois groupes de capture, nous devons donc vérifier lequel est défini et non vide
  			    const comment = match[1] || match[2] || match[3];
  			    comments.push(comment.trim());}}
    	    if (comments.length > 0) {
				console.log(comments[comments.length-1]);
				// prend la dirniere commentaire
				let comentaire= comments[comments.length-1]+` :donné directement le code et avec ${extension}`
				api(comentaire).then(rep=>{
					let answer=extractCodeBlockContent(rep)
						editor.edit((editBuilder) => {
							editBuilder.insert(endPosition, answer);
						}).then(() => {
							vscode.window.showInformationMessage('Texte genérer avec succès !');
						});
					}).catch(e=>{vscode.window.showInformationMessage(`il y a une erreur avec gpt :`);})
    	    } else {vscode.window.showInformationMessage('Aucun commentaire trouvé dans le fichier.');}
    	  } catch (err) {
    	    vscode.window.showErrorMessage(`Erreur lors de la lecture du fichier : ${err.message}`);}}});
	context.subscriptions.push(disposable);

	//2eme command commenter un code
	let disposable1 = vscode.commands.registerCommand('code-gen.comment', () => {
		let editor = vscode.window.activeTextEditor;
        // Vérifiez s'il y a un éditeur de texte actif
        if (!editor) {
			return;
		}
		//extraire le code selectioner
		const document = editor.document;
  		const selection = editor.selection;
  		const selectedCode = document.getText(selection);
		api(`write this ${selectedCode} code with comments`).then(rep=>{
			let answer=extractCodeBlockContent(rep)
			editor.edit((editBuilder) => {
				//remplacer le code selctionner par le nouveau code commenter
				editBuilder.replace(selection, answer);
			}).then(() => {
				vscode.window.showInformationMessage('Texte genérer avec succès !');
			});
		}).catch(e=>{
			vscode.window.showInformationMessage(`il y a une erreur avec gpt :`);
		})
	});
	context.subscriptions.push(disposable1);


	//3eme command ecrire des test unitaire
	let disposable2 = vscode.commands.registerCommand('code-gen.unitTest', () => {
		const editor = vscode.window.activeTextEditor;
    	if (!editor) {
    	  vscode.window.showInformationMessage('Aucun fichier ouvert.');
    	  return;
    	}
		//extraire le nom de fichier
		const pathe = editor.document.fileName;
		const activeFileName = path.basename(pathe);
		//le texte selectionner
		const selection = editor.selection;
    	if (selection.isEmpty) {
    	  vscode.window.showInformationMessage('Sélectionnez du code à transférer.');
    	  return;
    	}
		const selectedCode = editor.document.getText(selection);
		//nom de fichier de test est de la forme suivant (test-*)
		const newFilePath = path.join(path.dirname(pathe), `Test-${activeFileName}`);
		const newFileUri = vscode.Uri.file(newFilePath);
		api("write a unit test for this code:\n" +selectedCode+" ,and import the necessary modules").then(rep=>{
			let answer=extractCodeBlockContent(rep)
			fs.appendFile(newFileUri.fsPath,answer, (err) => {//inserer dans le fichier et crée le fichier s'il n'existe pas
				if (err) {
				  vscode.window.showErrorMessage('Une erreur sur la generation des test unitaire');
				  console.error(err);
				  return;
				}
				vscode.window.showInformationMessage(`les test sont inséré dans ${newFileName}`);
			});
		}).catch(e=>{
			vscode.window.showInformationMessage(`il y a une erreur avec gpt :`);
		})
	});
	context.subscriptions.push(disposable2);

	//4eme refactorer un code existant pour améliorer sa qualité
	let disposable3 = vscode.commands.registerCommand('code-gen.refactorer', () => {
		let editor = vscode.window.activeTextEditor;
        // Vérifiez s'il y a un éditeur de texte actif
        if (!editor) {
			return;
		}
		//extraire le code selectioner
		const document = editor.document;
  		const selection = editor.selection;
  		const selectedCode = document.getText(selection);
		api(`refactor and fix  this ${selectedCode} to improve its quality, just give the code`).then(rep=>{
			let answer=extractCodeBlockContent(rep)
			editor.edit((editBuilder) => {
				//remplacer le code selctionner par le nouveau code commenter
				editBuilder.replace(selection, answer);
			}).then(() => {
				vscode.window.showInformationMessage('Texte genérer avec succès !');
			});
		}).catch(e=>{
			vscode.window.showInformationMessage(`il y a une erreur avec gpt :`);
		})
	});
	context.subscriptions.push(disposable3);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
