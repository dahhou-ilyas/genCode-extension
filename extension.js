
const vscode = require('vscode');
const { privateEncrypt } = require('crypto');
const axios = require('axios');
const {retrieveAnswer}=require('./gencode/genfonction')
const {extractCodeBlockContent}=require('./gencode/extractcode')
const path = require('path');
const fs = require('fs');

const {runServer}=require('./websocket/ws')
//api chatgpt configuratonio


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	runServer()

	//1er commande generer un code
	let disposable = vscode.commands.registerCommand('code-gen.gencode', function () {
		const editor = vscode.window.activeTextEditor;

    	if (editor) {
    	  const document = editor.document;
		  //le dernier position dans le fichier active
		  const lastLine = document.lineAt(document.lineCount - 1);
		  const endPosition = new vscode.Position(lastLine.lineNumber, lastLine.text.length);

		  //extraire extension de fichier
		  const filePath = document.fileName;
		  const extension = path.extname(filePath).slice(1);

    	  try {
    	    const content = document.getText();
			

			const commentRegex = /\/\/(.*)|\/\*([\s\S]*?)\*\/|#(.*)/g;
  			const comments = [];

  			for (let i = 0; i < document.lineCount; i++) {
  			  const line = document.lineAt(i).text;
  			  let match;
  			  while ((match = commentRegex.exec(line))) {
  			    // Nous avons trois groupes de capture, nous devons donc vérifier lequel est défini et non vide
  			    const comment = match[1] || match[2] || match[3];
  			    comments.push(comment.trim());
  			  }
  			}
			console.log(comments);


    	    if (comments.length > 0) {
				console.log(comments[comments.length-1]);
				let comentaire= comments[comments.length-1]+`avec ${extension} et sans commentaire`

				retrieveAnswer(comentaire).then(rep=>{
					let answer=extractCodeBlockContent(rep)

					//inserer la réponse dans le fichier
					editor.edit((editBuilder) => {
						editBuilder.insert(endPosition, answer);
					}).then(() => {
						vscode.window.showInformationMessage('Texte genérer avec succès !');
					});

				}).catch(e=>{
					vscode.window.showInformationMessage(`il y a une erreur avec gpt :`);
				})


    	    } else {
    	      vscode.window.showInformationMessage('Aucun commentaire trouvé dans le fichier.');
    	    }
    	  } catch (err) {
    	    vscode.window.showErrorMessage(`Erreur lors de la lecture du fichier : ${err.message}`);
    	  }
    	}
	});


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

		
		console.log(selectedCode);
		retrieveAnswer("comment the following code :" +selectedCode).then(rep=>{
			let answer=extractCodeBlockContent(rep)

			//inserer la réponse dans le fichier
			editor.edit((editBuilder) => {
				editBuilder.replace(selection, answer);
			}).then(() => {
				vscode.window.showInformationMessage('Texte commenter avec succès !');
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
		const filePath = editor.document.fileName;
		const extension = path.extname(filePath).slice(1);

		//extraire le nom de fichier
		const pathe = editor.document.fileName;
		const activeFileName = path.basename(pathe);
		console.log(activeFileName);

		//le texte selectionner
		const selection = editor.selection;
    	if (selection.isEmpty) {
    	  vscode.window.showInformationMessage('Sélectionnez du code à transférer.');
    	  return;
    	}
		const selectedCode = editor.document.getText(selection);

		//nom de fichier avect test-*
		const newFilePath = path.join(path.dirname(pathe), `Test-${activeFileName}`);
		const newFileUri = vscode.Uri.file(newFilePath);

		retrieveAnswer("write a unit test for this code :" +selectedCode).then(rep=>{
			let answer=extractCodeBlockContent(rep)
			fs.appendFile(newFileUri.fsPath, answer, (err) => {
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

		// fs.appendFile(newFileUri.fsPath, selectedCode, (err) => {
		// 	if (err) {
		// 	  vscode.window.showErrorMessage('Une erreur est survenue lors de l\'insertion du code.');
		// 	  console.error(err);
		// 	  return;
		// 	}
		// 	vscode.window.showInformationMessage(`Code inséré dans ${newFileName}`);
		// });












	});
	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
