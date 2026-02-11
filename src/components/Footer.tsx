const Footer = ({children} : {children?:any}) => {

    return (
        <footer className="p-2 text-muted-foreground flex justify-between">
            <p>© {new Date().getFullYear()} BloggIng, Inc</p>
            {children}
        </footer>
    );
};

export default Footer;
