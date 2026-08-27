import { fetchFilesFromGitHubAPI } from "@mat3ra/code/dist/js/utils";
import { showErrorAlert } from "@mat3ra/cove/dist/other/alerts";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import React, { useEffect, useState } from "react";

export interface Transformation {
    id: string;
    title: string;
    content: string;
}

interface TransformationSelectorProps {
    transformation: Transformation | null;
    pythonCode: string;
    setPythonCode: (pythonCode: string) => void;
    setTransformation: (transformation: Transformation | null) => void;
    url?: string;
}

const emptyTransformation: Transformation = {
    id: "custom-transformation",
    title: "Custom Transformation (Empty)",
    content: `"""Custom Transformation"""\n"""BLOCK: Main"""\ninput_materials=materials_in\n`,
};

const DEFAULT_URL =
    "https://api.github.com/repos/mat3ra/api-examples/contents/other/python_transformations";

const TITLE_REGEX = /^"""TITLE: (.*?)"""\n/;

function TransformationSelector(props: TransformationSelectorProps) {
    const { transformation, setTransformation, setPythonCode, url = DEFAULT_URL } = props;
    const [transformations, setTransformations] = useState<Transformation[]>([]);
    const [isDataFetched, setIsDataFetched] = useState(false);

    useEffect(() => {
        if (!isDataFetched) {
            fetchFilesFromGitHubAPI(url)
                .then((files) => {
                    const pythonFiles = files.filter((file) => file.name.match(/.*\.py/));
                    return Promise.all(
                        pythonFiles.map(async (file) => {
                            const rawResponse = await fetch(file.download_url);
                            const content = await rawResponse.text();
                            const titleMatch = content.match(TITLE_REGEX);
                            const title = titleMatch ? titleMatch[1] : "No title";
                            return { id: file.name, title, content };
                        }),
                    );
                })
                .then((transformationsData) => {
                    setTransformations([...transformationsData, emptyTransformation]);
                    if (!transformation) {
                        setTransformation(transformationsData[0]);
                        setPythonCode(transformationsData[0].content);
                    }
                    setIsDataFetched(true);
                })
                .catch((error) => {
                    showErrorAlert("Error fetching transformations");
                    console.error(error);
                    setTransformations([emptyTransformation]);
                });
        }
    }, [isDataFetched, transformation, url]);

    return (
        <Autocomplete
            data-tid="transformation-selector"
            size="small"
            value={transformation}
            getOptionLabel={(option) => option.title}
            options={transformations}
            onChange={(_event, newValue) => {
                if (newValue) {
                    setPythonCode(newValue.content);
                    setTransformation(newValue);
                }
            }}
            renderInput={(params) => (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <TextField {...params} label="Transformation" placeholder="Select transformation" />
            )}
        />
    );
}

export default TransformationSelector;
