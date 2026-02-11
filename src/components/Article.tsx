import {Heart, MessageCircle} from "lucide-react";

const Article = ({
                     heading = "Heading",
                     description = "Description",
                     author = "Author",
                     likes = 99,
                     comments = 99,
                     image,
                     slug = '/'
                 }:
                 {
                     heading: string
                     description: string
                     author: string
                     likes: number
                     comments: number
                     image: string
                     slug: string
                 }
) => {
    return (
        <div className="flex justify-center">
            <a href={slug} className="flex max-w-2xl gap-8">
                <div className="flex flex-col gap-4">
                    <div className="text-sm text-muted-foreground">by <span
                        className="text-foreground font-semibold">{author}</span></div>
                    <div className="flex flex-col gap-2"><h2
                        className="font-bold text-xl sm:text-2xl line-clamp-3">{heading}</h2>
                        <div className="text-muted-foreground line-clamp-2">{description}</div>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex gap-1 items-center"><Heart size={18}/><span>{likes}</span></span>
                        <span className="flex gap-1 items-center"><MessageCircle
                            size={18}/><span>{comments}</span></span>
                    </div>
                </div>
                <div className="flex items-center shrink-0">
                    <img src={image} alt="article" className="w-24 h-16 sm:w-40 sm:h-26.5 object-cover"/>
                </div>
            </a>
        </div>
    );
};

export default Article;
