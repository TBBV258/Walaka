class PaginationManager {
    constructor(itemsPerPage = 6) {
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.totalItems = 0;
        this.isLoading = false;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    calculateRange() {
        const from = (this.currentPage - 1) * this.itemsPerPage;
        const to = from + this.itemsPerPage - 1;
        return { from, to };
    }

    getPageInfo() {
        const start = ((this.currentPage - 1) * this.itemsPerPage) + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
        return {
            start,
            end,
            total: this.totalItems,
            currentPage: this.currentPage,
            totalPages: Math.ceil(this.totalItems / this.itemsPerPage)
        };
    }
}