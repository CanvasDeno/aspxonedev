        let editor;
        
        // --- 1. Snippet Definitions ---
        const snippets = {
            navbar: `<nav class="bg-purple-600 p-4 shadow-lg mb-6">\n    <div class="container mx-auto flex justify-between items-center">\n        <a href="#" class="text-white text-xl font-bold">AspxoneDev</a>\n        <div class="hidden md:flex space-x-6">\n            <a href="#" class="text-purple-100 hover:text-white transition">Home</a>\n            <a href="#" class="text-purple-100 hover:text-white transition">Features</a>\n            <a href="#" class="text-purple-100 hover:text-white transition">Pricing</a>\n            <a href="#" class="text-purple-100 hover:text-white transition">Contact</a>\n        </div>\n    </div>\n</nav>`,
            heading: '<h1 class="text-2xl font-bold text-purple-800 mb-4">New Heading</h1>',
            paragraph: '<p class="text-gray-700 leading-relaxed mb-4">\n    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n</p>',
            breakline: '<br class="my-4" />',
            headerline: '<hr class="my-8 border-t-2 border-purple-100" />',
            button: '<button class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded shadow-md transition-colors">\n    Click Me\n</button>',
            link: '<a href="#" class="text-purple-600 hover:text-purple-800 underline">Link Text</a>',
            textbox: '<input type="text" placeholder="Enter text..." class="border border-purple-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500">',
            footer: '<footer class="bg-gray-100 p-4 mt-8 text-center text-gray-600 text-sm">\n    &copy; 2025 AspxoneDev App. All rights reserved.\n</footer>',
            audio: '<audio controls class="w-full mt-2">\n    <source src="audio.mp3" type="audio/mpeg">\n    Your browser does not support the audio element.\n</audio>',
            video: '<video controls class="w-full rounded-lg shadow-lg">\n    <source src="movie.mp4" type="video/mp4">\n    Your browser does not support the video tag.\n</video>'
        };

        const codeWrappers = {
            php: { start: '<?php\n', end: '\n?>' },
            erb: { start: '<% ', end: ' %>' },
            razor: { start: '@{\n    ', end: '\n}' },
            javascript: { start: '<script>\n', end: '\n<\/script>' },
            typescript: { start: '<script lang="ts">\n', end: '\n<\/script>' },
            html: { start: '<script>\n', end: '\n<\/script>' }
        };

        // --- 2. Initialize Monaco Editor ---
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }});

        require(['vs/editor/editor.main'], function() {
            // Initial Content - Ensuring tags are present
            const initialCode = [
                '<!DOCTYPE html>',
                '<html lang="en">',
                '<head>',
                '    <meta charset="UTF-8">',
                '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
                '    <title>My AspxoneDev App</title>',
                '    <script src="https://cdn.tailwindcss.com"><\/script>',
                '</head>',
                '<body class="bg-slate-50 p-10">',
                '    <!-- Start building here -->',
                '    <nav class="bg-purple-600 p-4 shadow-lg mb-8 rounded-lg">',
                '        <div class="flex justify-between items-center">',
                '             <a href="#" class="text-white text-xl font-bold">AspxoneDev</a>',
                '             <div class="space-x-4">',
                '                 <a href="#" class="text-purple-100 hover:text-white">Home</a>',
                '                 <a href="#" class="text-purple-100 hover:text-white">About</a>',
                '             </div>',
                '        </div>',
                '    </nav>',
                '    <h1 class="text-3xl font-bold text-purple-700">Hello World</h1>',
                '    <p class="mt-4 text-gray-600">Start editing to see changes in the preview.</p>',
                '</body>',
                '</html>'
            ].join('\n');

            editor = monaco.editor.create(document.getElementById('editor-container'), {
                value: initialCode,
                language: 'html',
                theme: 'vs-dark',
                automaticLayout: true,
                fontSize: 14,
                fontFamily: 'Fira Code, Consolas, "Courier New", monospace',
                minimap: { enabled: false }, // Disabled for better split view space
                padding: { top: 20 },
                wordWrap: 'on'
            });

            // Initial preview load
            updatePreview();

            // Status bar update
            editor.onDidChangeCursorPosition((e) => {
                document.getElementById('cursor-position').innerText = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
            });

            // Auto-update preview on change (debounced)
            let debounceTimer;
            editor.onDidChangeModelContent(() => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(updatePreview, 1000); // Update after 1 second of inactivity
            });
        });

        // --- 3. Interaction Logic ---

        // Format Code
        function formatCode() {
            if (editor) {
                editor.getAction('editor.action.formatDocument').run();
            }
        }

        // Update Preview
        function updatePreview() {
            if (!editor) return;
            
            const content = editor.getValue();
            const frame = document.getElementById('previewFrame');
            const lang = document.getElementById('languageSelect').value;

            // Warning for server-side code
            const hasServerCode = content.includes('<?php') || content.includes('@{') || content.includes('<%');
            const warningHtml = hasServerCode ? 
                `<div style="background:#fff3cd; color:#856404; padding:8px; text-align:center; font-family:sans-serif; font-size:12px; border-bottom:1px solid #ffeeba; position:sticky; top:0; z-index:99;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Note: PHP/ERB/Razor code runs on a server and won't execute in this browser preview.
                 </div>` : '';

            // Inject warning into preview if needed
            let finalContent = content;
            if (hasServerCode) {
                if (finalContent.includes('<body')) {
                    finalContent = finalContent.replace(/<body[^>]*>/, (match) => match + warningHtml);
                } else {
                    finalContent = warningHtml + finalContent;
                }
            }

            frame.srcdoc = finalContent;
        }

        // Change Language / Mode
        const langSelect = document.getElementById('languageSelect');
        const langDisplay = document.getElementById('language-display');

        langSelect.addEventListener('change', (e) => {
            const mode = e.target.value;
            let monacoMode = 'html';

            switch(mode) {
                case 'php': monacoMode = 'php'; break;
                case 'erb': monacoMode = 'html'; break;
                case 'razor': monacoMode = 'razor'; break;
                case 'javascript': monacoMode = 'javascript'; break;
                case 'typescript': monacoMode = 'typescript'; break;
                default: monacoMode = 'html';
            }

            if (editor) {
                monaco.editor.setModelLanguage(editor.getModel(), monacoMode);
            }
            langDisplay.innerText = mode.toUpperCase();
            updatePreview(); // Refresh preview (mainly for warnings)
        });

        // Insert Snippets
        function insertSnippet(type) {
            if (!editor) return;

            const selection = editor.getSelection();
            const id = { major: 1, minor: 1 };             
            let textToInsert = "";
            const currentLang = langSelect.value;

            if (type === 'codeblock') {
                const wrapper = codeWrappers[currentLang] || codeWrappers['html'];
                textToInsert = wrapper.start + "    // Your code here" + wrapper.end;
            } else {
                textToInsert = snippets[type] || "";
            }
            
            const op = {identifier: id, range: selection, text: textToInsert, forceMoveMarkers: true};
            editor.executeEdits("my-source", [op]);
            editor.focus();
        }

        // Save File Logic
        function saveFile() {
            if (!editor) return;

            const content = editor.getValue();
            const currentLang = langSelect.value;
            let fileName = document.getElementById('fileName').value || 'app';
            let extension = '.html';

            switch(currentLang) {
                case 'php': extension = '.php'; break;
                case 'erb': extension = '.html.erb'; break;
                case 'razor': extension = '.cshtml'; break;
                case 'javascript': extension = '.js'; break;
                case 'typescript': extension = '.ts'; break;
                default: extension = '.html';
            }

            if (!fileName.endsWith(extension)) {
                fileName = fileName.replace(/\.(html|php|erb|cshtml|js|ts)$/, '') + extension;
            }

            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
