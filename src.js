function generate() {
            const dataFile = document.getElementById("data_file").files[0];
            const outputType = document.getElementById("output_type").value;
            
            if (!dataFile) {
                alert("Please upload a data file first!");
                return;
            }
            
            // Show loading
            document.getElementById("plot-placeholder").innerHTML = "Generating plot...";
            
            // Generate GNUplot code (your original logic)
            const inputFileName = dataFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
            const extension = outputType.includes("png") ? "png" : "pdf";
            const outputFile = `${inputFileName}.${extension}`;
            
            const gnuplotCode = `# Generated for "${inputFileName}"
set terminal ${outputType}
set output "${outputFile}"
plot "${inputFileName}" using 2:xtic(1)
reset
`;
            
            // Display code
            document.getElementById("output_code").textContent = gnuplotCode;
            
            // Send to backend via FormData
            const formData = new FormData();
            formData.append("data_file", dataFile);
            formData.append("gnuplot_code", gnuplotCode);
            formData.append("output_type", outputType);
            formData.append("output_file", outputFile);  // Pass output filename for backend
            
            fetch("/generate", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Display image or PDF
                    if (extension === "png") {
                        document.getElementById("plot-placeholder").innerHTML = 
                            `<img src="data:image/png;base64,${data.base64_image}" alt="Generated Plot">`;
                    } else {
                        document.getElementById("plot-placeholder").innerHTML = 
                            `<embed src="data:application/pdf;base64,${data.base64_image}" type="application/pdf" width="100%" height="600px">`;
                    }
                } else {
                    document.getElementById("plot-placeholder").innerHTML = `Error: ${data.error}`;
                }
            })
            .catch(error => {
                document.getElementById("plot-placeholder").innerHTML = `Error: ${error}`;
                console.error("Fetch error:", error);
            });
        }