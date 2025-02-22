"use client";

import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { formUrlQuery, removeKeyFromUrlQuery } from "@/lib/url";
interface Props {
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
  route: string;
}
const LocalSearch = ({ imgSrc, placeholder, otherClasses, route }: Props) => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [searchQuery, setSearchQuery] = useState(query);
  const router = useRouter();
  const pathName = usePathname();
  useEffect(() => {
    const delayDeboundFn = setTimeout(() => {
      if (searchQuery) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: searchQuery,
        });
        router.push(newUrl, { scroll: false });
      } else {
        if (pathName === route) {
          const newUrl = removeKeyFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["query"],
          });
          router.push(newUrl, { scroll: false });
        }
      }
    }, 1500);
    return () => clearTimeout(delayDeboundFn);
  }, [searchQuery, router, route, searchParams, pathName]);
  return (
    <div
      className={`background-light800_darkgradient flex min-h-[56px]
    grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      <Image
        src={imgSrc}
        alt="Search"
        width={24}
        height={24}
        className="cursor-pointer"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
      ></Input>
    </div>
  );
};
export default LocalSearch;
