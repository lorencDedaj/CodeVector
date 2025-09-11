import React from "react";

interface UploadButtonProps {
    loading: boolean,
    name: string,
    repoUrl: string
}

export default function UploadButton({loading, name, repoUrl}:UploadButtonProps) {

    return (
<button disabled={loading || !name || !repoUrl}>{loading ? `Saving` : 'Create'}</button>
    )
}