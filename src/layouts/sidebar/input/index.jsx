export default function LayoutInput() {
    return (
        <div className="flex justify-center w-full p-2  ">
            <input
                className="rounded-2xl bg-gray-800 text-white p-2 lg:w-[90%]  lg:max-w-[150px]  hidden lg:block  h-7  border border-transparent outline-0 focus:border-gray-700  sm:max-w-[200px]"
                type="text"
                placeholder="Ara..."

            />
        </div>
    );
}
