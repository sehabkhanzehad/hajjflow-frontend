const PageHeading = ({ title, description, className }) => {
    return (
        <div className={className}>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
        </div>
    );
};

export default PageHeading;