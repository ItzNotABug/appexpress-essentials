import React from 'react';

type Props = { name: string };

const ReactTSXComponent = ({ name }: Props) => {
    return <div>Hello, this is the `{name}`</div>;
};

export default ReactTSXComponent;
